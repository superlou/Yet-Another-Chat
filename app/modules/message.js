define([
  "namespace",
  "use!backbone",
  "text!templates/message_tpl.html"
],

function(namespace, Backbone, message_tpl) {
	var Message = namespace.module();

	Message.Model = Backbone.Model.extend({
		defaults: {
			origin: 'unknown',
			text: '',
			sent_at: ''
		}
	});

	Message.Collection = Backbone.Collection.extend({
		model: Message.model
	});

	Message.Views.Display = Backbone.View.extend({
		className: 'message',

		initialize: function() {
			_.bindAll(this,'render');
		},

		render: function() {
			var template = _.template(message_tpl);
			$(this.el).html(template({msg: this.model}));

			return this;
		}
	});

	return Message;
});