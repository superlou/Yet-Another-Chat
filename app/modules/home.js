define([
	"namespace",
	"use!backbone",
	"modules/room",
	"text!templates/home_tpl.js"
],

function(namespace, Backbone, Room, home_tpl) {
	var Home = namespace.module();

	Home.Model = Backbone.Model.extend({
		defaults: {
			"user": "guest",
			"rooms": '',
			"socket": ''
		},

		initialize: function() {
			this.set({rooms: new Room.Collection()});
			this.set({socket: io.connect('http://localhost')});

			var room1 = new Room.Model({id: 'english', name: "English"});
			var room2 = new Room.Model({id: 'japanese', name: "Japanese"});
			var room3 = new Room.Model({id: 'chinese', name: "Chinese"});
			this.get('rooms').add([room1, room2, room3]);
		}
	});

	Home.Views.Main = Backbone.View.extend({
		el: $('body'),

		events: {
		},

		initialize: function() {
			_.bindAll(this,'render');

			this.model.get('rooms').bind('add', this.append_room);

			this.render();
		},

		render: function() {
			var template = _.template(home_tpl, {user: this.model.get('user')});
			$(this.el).html(template);

			_.each(this.model.get('rooms').models, function(room) {
				var view = new Room.Views.RoomRow({model: room});
				$('#rooms_list').append(view.render().el);
			});

			return this;
		}

	});

	return Home;
});