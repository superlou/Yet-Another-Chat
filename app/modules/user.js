define([
	"namespace",
	"use!backbone",
	"text!templates/user_login_tpl.html",
	"text!templates/attendee_tpl.html",
	"text!templates/active_user_tpl.html"
],
function(namespace, Backbone, user_login_tpl, attendee_tpl, active_user_tpl) {
	var User = namespace.module();

	User.Model = Backbone.Model.extend({
		idAttribute: '_id',
		urlRoot: 'users',

		defaults: {
			name: 'Guest'
		},

		initialize: function() {
			var socket = io.connect(document.domain);

			var self = this;
			socket.on('user_changed', function(data) {
				if (self.get('_id') == data.user_id) {
					self.fetch();
				}
			});
		}
	});

	User.Collection = Backbone.Collection.extend({
		model: User.Model,

		initialize: function() {
			_.bindAll(this, 'find_by_name');
		},

		find_by_name: function(name) {
			var result = _.find(this.models, function(user) {
				return user.get('name') === name;
			});
			return result;
		}
	});

	User.Views.Login = Backbone.View.extend({
		el: $('body'),
		template: _.template(user_login_tpl),

		events: {
			'click #submit': 'on_login'	
		},

		initialize: function() {
			_.bindAll(this, 'render', 'on_login');
			
			this.render();	
		},

		render: function() {
			var template = _.template(user_login_tpl);
			this.$el.html(template({user: this.model}));
		},

		on_login: function() {
			$.post('/session/request_username.json',
				{username: $('#username').val()},
				function(data) {
					window.location.replace('/');
				}
			);

			
		}
	});

	User.Views.Attendee = Backbone.View.extend({
		class: 'attendee',
		template: "app/templates/attendee_tpl.html",

		initialize: function() {
			_.bindAll(this,'render','unrender');

			this.model.on('change', this.render);
			this.model.on('remove', this.unrender);
		},

		render: function() {
			var template = _.template(attendee_tpl);
			this.$el.html(template({user: this.model}));
			return this;
		},

		unrender: function() {
			this.$el.remove();
		}
	});

	User.Views.ActiveUser = Backbone.View.extend({

		initialize: function() {
			_.bindAll(this,'render', 'edit_in_place', 'update_in_place');			
		},

		events: {
			'click #active_username': 'edit_in_place'
		},

		edit_in_place: function() {
			this.$el.find('#active_username').html(
				'<input type="text" name="username" value="'+this.model.get('name')+'">'
			);
			this.$el.undelegate('#active_username', 'click');
			this.$el.delegate('#active_username', 'keydown', this.update_in_place);
		},

		update_in_place: function(event_data) {
			if (event_data.keyCode == 13) {
				this.model.save({name: this.$el.find('#active_username input').val()});
				var socket = io.connect(document.domain);
				socket.emit('user_change',{user_id: this.model.get('_id')});
			}
		},

		render: function() {
			var template = _.template(active_user_tpl);
			this.$el.html(template({user: this.model}));
			return this;
		}
	});

	return User;
});