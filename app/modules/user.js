define([
	"namespace",
	"use!backbone",
	"text!templates/user_login_tpl.html",
	"text!templates/attendee_tpl.html"
],
function(namespace, Backbone, user_login_tpl, attendee_tpl) {
	var User = namespace.module();

	User.Model = Backbone.Model.extend({
		defaults: {
			name: 'Guest'
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

		initialize: function() {
			_.bindAll(this,'render','unrender');

			this.model.bind('change', this.unrender);
			this.model.bind('remove', this.unrender);
		},

		render: function() {
			var template = _.template(attendee_tpl);
			this.$el.html(template({user: this.model}));
			return this;
		},

		unrender: function() {
			this.$el.remove();
		}
	})

	return User;
});