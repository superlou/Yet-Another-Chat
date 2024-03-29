require([
  "namespace",

  // Libs
  "jquery",
  "use!backbone",

  // Modules
  "modules/home",
  "modules/user"
],

function(namespace, jQuery, Backbone, Home, User) {
  
  // Defining the application router, you can attach sub routers here.
  var Router = Backbone.Router.extend({
    routes: {
      "": "index",
      "logout": "logout"
    },

    index: function() {
      var route = this;
      //console.log(Io);

      $.get('/session/user_id', function(data) {
        if (data.user_id) {
          
          var user = new User.Model({_id: data.user_id});
          user.fetch();

          var home = new Home.Model({user: user});
          var home_view = new Home.Views.Main({model: home});         

        } else {

          // Get /session/new then redirect back
          $.get('/session/new', function(data) {
            window.location = '/';
          });

        }
      });
    },

    logout: function() {
      $.get('/session/destroy', function(data) {
            window.location = '/';
      });
    }
  });

  // Shorthand the application namespace
  var app = namespace.app;  

  // Treat the jQuery ready function as the entry point to the application.
  // Inside this function, kick-off all initialization, everything up to this
  // point should be definitions.
  jQuery(function($) {

    // Define your master router on the application namespace and trigger all
    // navigation from this instance.
    app.router = new Router();

    // Trigger the initial route and enable HTML5 History API support
    Backbone.history.start({ pushState: true });

    // All navigation that is relative should be passed through the navigate
    // method, to be processed by the router.  If the link has a data-bypass
    // attribute, bypass the delegation completely.
    $(document).on("click", "a:not([data-bypass])", function(evt) {
      // Get the anchor href and protcol
      var href = $(this).attr("href");
      var protocol = this.protocol + "//";

      // Ensure the protocol is not part of URL, meaning its relative.
      if (href && href.slice(0, protocol.length) !== protocol &&
        href.indexOf("javascript:") !== 0) {

        // Stop the default event to ensure the link will not cause a page
        // refresh.
        evt.preventDefault();

        // This uses the default router defined above, and not any routers
        // that may be placed in modules.  To have this work globally (at the
        // cost of losing all route events) you can change the following line
        // to: Backbone.history.navigate(href, true);
        app.router.navigate(href, true);
      }
    });
  });
  
});