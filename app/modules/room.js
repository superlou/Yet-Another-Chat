define([
  "namespace",
  "use!backbone",
  "modules/message",
  "text!templates/room_tpl.html",
  "text!templates/room_row_tpl.html"
],

function(namespace, Backbone, Message, room_tpl, room_row_tpl) {
	var Room = namespace.module();

	Room.Model = Backbone.Model.extend({
		defaults: {
			id: 0,
			name: "Default Room",
			is_open: false,
			is_active: false,
			needs_attention: false,
			messages: '',
			socket: ''
		},

		initialize: function() {
			_.bindAll(this,'listen_for_messages');
			this.set({messages: new Message.Collection()});
		},

		listen_for_messages: function() {
			var socket_url = 'http://localhost/'
			this.set({socket: io.connect(socket_url)});

			var self = this;
      		this.get('socket').on('world_message', function(data) {
      			if (data.room_id === self.get('id')) {
      				var msg = new Message.Model({
      					origin: data.origin,
	      				text: data.msg,
	      				sent_at: data.sent_at 
	      			});	
      				self.get('messages').add(msg);
	  				console.log(self.get('messages'));
      			}
      		});
		}
	});

	Room.Collection = Backbone.Collection.extend({
		model: Room.Model,

		initialize: function() {
			_.bindAll(this, 'set_active');	
		},

		set_active: function(model_to_activate) {			
			_.each(this.models, function(room) {
				//room.set({is_active: false});	// STUPID BUG HERE??
			})

			model_to_activate.set({is_active: true});
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

			this.model.bind('change', this.render, this);
		},

		render: function() {
			$(this.el).html(this.template({room: this.model}));
			return this;
		},

		attend_room: function() {
			this.model.collection.set_active(this.model);

			if (this.model.get('is_open') == false) {
				this.open_room();
			}

			$('input').focus();
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
      		_.bindAll(this,'render','on_input_keydown', 'send_message','add_one');

			var message_collection = this.model.get('messages');
			message_collection.bind('add', this.add_one, this);
			
			var self = this;
			this.model.bind('change', function() {
				if (self.model.get('is_active') == false) {
					$(self.el).hide();
				} else {
					$(self.el).show();
				}
			});
	    },

	    render: function() {
	    	var template = _.template(room_tpl, {name: this.model.get('name')});
			$(this.el).html(template);
	    	return this;
	    },

	    add_one: function(message) {
	    	var message_view = new Message.Views.Display({model: message});
	    	$(this.el).find('.log').prepend(message_view.render().el);
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
		    	msg: text,
		    	sent_at: timestamp
		    });
	    }
	});

	return Room;
});
