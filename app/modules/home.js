define([
	"namespace",
	"use!backbone",
	"modules/room",
	"modules/user",
	"text!templates/home_tpl.js"
],

function(namespace, Backbone, Room, User, home_tpl) {
	var Home = namespace.module();

	Home.Model = Backbone.Model.extend({
		defaults: {
			"user": new User.Model(),
			"rooms": '',
			"socket": ''
		},

		initialize: function() {
			this.set({rooms: new Room.Collection()});
			this.set({socket: io.connect(document.domain)});
			this.get('socket').emit('set_username', this.get('user').get('name'));

			var room1 = new Room.Model({id: 'english', name: "English"});
			var room2 = new Room.Model({id: 'japanese', name: "Japanese"});
			var room3 = new Room.Model({id: 'chinese', name: "Chinese"});
			var room4 = new Room.Model({id: 'spanish', name: "Spanish"});

			var self = this;
			_.each([room1, room2, room3, room4], function(room) {
				room.set({user: self.get('user')});
			});

			this.get('rooms').add([room1, room2, room3, room4]);
		}
	});

	Home.Views.Main = Backbone.View.extend({
		el: $('body'),

		events: {
		},

		initialize: function() {
			_.bindAll(this,'render', 'set_socket_username');

			this.model.get('rooms').on('add', this.append_room);
			this.model.get('user').on('change', this.render);
			this.model.get('user').on('change', this.set_socket_username);

			this.render();
		},

		render: function() {
			var template = _.template(home_tpl);
			this.$el.html(template);

			_.each(this.model.get('rooms').models, function(room) {
				var view = new Room.Views.RoomRow({model: room});
				$('#rooms_list').append(view.render().el);

				if (room.get('is_open')) {
					var windowed_view = new Room.Views.Windowed({model: room});
					$('#content').append(windowed_view.render().el);
					console.log('here');
				}
			});

			var active_user = new User.Views.ActiveUser({model: this.model.get('user')});
			$('#active_user').html(active_user.render().el);

			return this;
		},

		set_socket_username: function() {
			this.model.get('socket').emit('set_username', this.model.get('user').get('name'));
		}
	});

	return Home;
});