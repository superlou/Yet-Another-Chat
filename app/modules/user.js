define([
	"namespace",
	"use!backbone",
	"text!templates/user_login_tpl.html"
],
function(namespace, Backbone, user_login_tpl) {
	var User = namespace.module();

	User.Model = Backbone.Model.extend({
		defaults: {
			id: 0,
			name: 'Guest'
		}
	})

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

	return User;
});