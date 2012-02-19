// Set the require.js configuration for your application.
require.config({
  // Initialize the application with the main application file
  deps: ["main"],

  paths: {
    // JavaScript folders
    libs: "../assets/js/libs",
    plugins: "../assets/js/plugins",

    // Libraries
    jquery: "../assets/js/libs/jquery",
    underscore: "../assets/js/libs/underscore",
    backbone: "../assets/js/libs/backbone",
    layout: "../assets/js/libs/jquery.layout.min",
    ui: "../assets/js/libs/jquery-ui",
    io: "/socket.io/socket.io",
    slimscroll: "../assets/js/libs/slimScroll",

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
    },

    slimscroll: {
      deps: ["jquery","use!ui"]
    },

    layout: {
      deps: ["jquery", "use!ui"]
    },

    ui: {
      deps: ["jquery"]
    }
  }
});