define([
  "namespace",
  "use!backbone",
  "modules/message",
  "modules/user",
  "use!slimscroll",
  "text!templates/room_tpl.html",
  "text!templates/room_row_tpl.html"
],

function(namespace, Backbone, Message, User, SlimScroll, room_tpl, room_row_tpl) {
	var Room = namespace.module();

	Room.Model = Backbone.Model.extend({
		defaults: {
			id: 0,
			name: "Default Room",
			is_open: false,
			is_attended: false,
			needs_attention: false,
			missed_message_count: 0,
			messages: '',
			socket: '',
			user: '',
			attendees: ''
		},

		initialize: function() {
			_.bindAll(this,'listen_for_messages', 'read_messages');
			this.set({messages: new Message.Collection()});
			this.set({attendees: new User.Collection()});
		},

		listen_for_messages: function() {
			var socket_url = document.domain;
			this.set({socket: io.connect(socket_url)});

			this.get('socket').emit('enter_room',{
				user: 'guest', 
				room: this.get('id')
			});

			var self = this;
      		this.get('socket').on('room_message', function(data) {
      			if (data.room_id === self.get('id')) {
      				var msg = new Message.Model(data);	
      				self.get('messages').add(msg);

      				if (!self.get('is_attended')) {
      					count = self.get('missed_message_count') + 1;
      					self.set({missed_message_count: count});
      				}
      			}
      		});

      		this.get('socket').on('attendee_list', function(data) {
      			if (data.room_id === self.get('id')) {
	      			var attendees = [];

	      			_.each(data.names, function(username) {
	      				var attendee = new User.Model({name: username});
	      				attendees.push(attendee);
	      			})

	      			self.get('attendees').reset(attendees);	
      			}
      		});

      		this.get('socket').on('attendee_join', function(data) {
      			if (data.room_id === self.get('id')) {
      				var attendee = new User.Model({name: data.name});
      				self.get('attendees').add(attendee);
      			}
      		});

      		this.get('socket').on('attendee_disconnect', function(data) {
  				var attendees_collection = self.get('attendees');
  				var attendee = attendees_collection.find_by_name(data.name);
  				attendees_collection.remove(attendee);
      		});
		},

		read_messages: function() {
			this.set({missed_message_count: 0});
		}
	});

	Room.Collection = Backbone.Collection.extend({
		model: Room.Model,

		initialize: function() {
			_.bindAll(this, 'set_active');	
		},

		set_active: function(model_to_activate) {			
			_.each(this.models, function(room) {
				room.set({is_attended: false});
			})

			model_to_activate.set({is_attended: true});
		}
	});

	Room.Views.RoomRow = Backbone.View.extend({
		tagName: "li",
		template: _.template(room_row_tpl),
		className: "room-row",

		events: {
			"click a": "attend_room",
			"change this": "update"
		},

		initialize: function() {
			_.bindAll(this, 'render', 'attend_room', 'open_room');

			this.model.on('change', this.render, this);
		},

		render: function() {
			this.$el.html(this.template({room: this.model}));
			return this;
		},

		attend_room: function() {
			this.model.collection.set_active(this.model);

			if (this.model.get('is_open') == false) {
				this.open_room();
			}

			$('input').focus();

			$log = $('.log');
	    	$log.prop({ scrollTop: $log.prop("scrollHeight") });
	    	this.model.read_messages();
		},

		open_room: function() {
			var full_room_view = new Room.Views.Windowed({model: this.model});
			$('#content').append(full_room_view.render().el);
			this.model.set({is_open: true});
			this.model.listen_for_messages();
		},

		update: function() {
			console.log('test');
		}
	});

	Room.Views.Windowed = Backbone.View.extend({
		className: "room",

		events: {
			"keydown input": "on_input_keydown"
		},

	    initialize: function() {
      		_.bindAll(this,'render','on_input_keydown', 'send_message','add_one_message',
      					'scroll_to_bottom', 'reset_attendees', 'add_one_attendee');

			var message_collection = this.model.get('messages');
			message_collection.bind('add', this.add_one_message, this);

			var attendee_collection = this.model.get('attendees');
			attendee_collection.bind('reset', this.reset_attendees, this);
			attendee_collection.bind('add', this.add_one_attendee, this);
			
			var self = this;
			this.model.on('change', function() {
				if (self.model.get('is_attended') == false) {
					self.$el.hide();
				} else {
					self.$el.show();
				}
			});
	    },

	    render: function() {
	    	var template = _.template(room_tpl, {name: this.model.get('name')});
			this.$el.html(template);
			this.$el.find(".log").slimScroll({  	// Problems with updating slimScroll
				height: "100%",						// on dynamic content addition
				railVisible: true,
				start: 'bottom'
			});
			this.scroll_to_bottom();
	    	return this;
	    },

	    add_one_message: function(message) {
	    	var message_view = new Message.Views.Display({model: message});
	    	this.$el.find('.log').append(message_view.render().el);
	    	this.scroll_to_bottom();
	    },

	    reset_attendees: function(attendees) {
	    	var self = this;
	    	_.each(attendees.models, function(attendee) {
	    		self.add_one_attendee(attendee);
	    	});
	    },

	    add_one_attendee: function(attendee) {
	    	var attendee_view = new User.Views.Attendee({model: attendee});
	    	this.$el.find('.attendees').append(attendee_view.render().el);
	    },

	    scroll_to_bottom: function() {
	    	$log = this.$el.find('.log');
	    	$log.prop({ scrollTop: $log.prop("scrollHeight") });
	    },

	    on_input_keydown: function(event_data) {
	    	if (event_data.keyCode == 13) {
	    		var input_el = $(this.el).find('input');

	    		this.send_message(input_el.val());
	    		$(input_el).val("");
	    	}
	    },

	    send_message: function(text) {
	    	var socket = this.model.get('socket');

	    	var id = this.model.get('id');
	    	var timestamp = new Date().getTime();

	    	socket.emit('user_message', {
	    		room_id: id,
	    		origin: this.model.get('user').get('name'),
		    	text: text,
		    	sent_at: timestamp
		    });
	    }
	});

	return Room;
});
