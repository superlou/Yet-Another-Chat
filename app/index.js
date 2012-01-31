// Set the require.js configuration for your application.
require.config({
  paths: {
    // JavaScript folders
    libs: "../assets/js/libs",
    plugins: "../assets/js/plugins",

    // Libraries
    jquery: "../assets/js/libs/jquery",
    underscore: "../assets/js/libs/underscore",
    backbone: "../assets/js/libs/backbone",
    io: "/socket.io/socket.io",

    // Shim Plugin
    use: "../assets/js/plugins/use",
        
    // Text Plugin
    text: "../assets/js/plugins/text"
  },

  use: {
    backbone: {
      deps: ["use!underscore", "jquery"],
      attach: "Backbone"
    },

    underscore: {
      attach: "_"
    }
  }
});

require([
  "namespace",

  // Libs
  "jquery",
  "use!backbone",
  "io",

  // Modules
  "modules/home"
],

function (namespace, jQuery, Backbone, Io, Home) {
  // Treat the jQuery ready function as the entry point to the application.
  // Inside this function, kick-off all initialization, everything up to this
  // point should be definitions.
  jQuery(function($) {

    // Shorthand the application namespace
    var app = namespace.app;

    // Defining the application router, you can attach sub routers here.
    var Router = Backbone.Router.extend({
      routes: {
        "": "index"
      },

      index: function() {
        var route = this;

        var home = new Home.Model();
        var home_view = new Home.Views.Main({"model": home});
      }
    });
    
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
      if (href && href.slice(0, protocol.length) !== protocol) {
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
