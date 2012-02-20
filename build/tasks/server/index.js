// ============================================================================
// TASKS
// ============================================================================

task.registerTask("server", "Run development server.", function(prop) {
 	var props = ["server"];
	// If a prop was passed as the argument, use that sub-property of server.
	if (prop) { props.push(prop); }

	var options = config(props) || {};

	// Defaults set for server values
	var options = underscore.defaults(options, {
		favicon: "./favicon.ico",
		index: "./index.html",

		port: 8080,
		host: "127.0.0.1"
	});

	// HACK TO IDENTIFY BLUEHOST HOST IP
	if (props[1] === "bluehost") {
		options.host = "69.195.121.203";
	}

	options.folders = options.folders || {};

	// Ensure folders have correct defaults
	options.folders = underscore.defaults(options.folders, {
		app: "./app",
		assets: "./assets",
		dist: "./dist"
	});

	options.files = options.files || {};

	// Ensure files have correct defaults
	options.files = underscore.defaults(options.files, {
		"app/config.js": "app/config.js"
	});

	// Run the server
	task.helper("server", options);

	// Fail task if errors were logged
	if (task.hadErrors()) { return false; }

	log.writeln("Listening on http://" + options.host + ":" + options.port);
});

// ============================================================================
// HELPERS
// ============================================================================

task.registerHelper("server", function(options) {
	// Require libraries
	var _ = require('underscore')._;
	var fs = require("fs");
	var express = require("express");
	var async = require("async");

	var site = express.createServer();
	site.use(express.bodyParser());

	// Set up session store
	site.use(express.cookieParser());
	var MongoStore = require('connect-mongo');
	site.use(express.session({
		secret: 'apples', 
		store: new MongoStore({
			db: 'chat'
		})
	}));

	// Set up Mongoose
	var mongoose = require('mongoose');
	var Schema = mongoose.Schema;
	var ObjectId = Schema.ObjectId;

	var UserSchema = new Schema({
		id: ObjectId,
		name: String,
		registered: Boolean
	});
	var User = mongoose.model('User', UserSchema);

	mongoose.connect('mongodb://localhost/chat');

	// Map static folders
	Object.keys(options.folders).sort().reverse().forEach(function(key) {
		site.use("/" + key, express.static(options.folders[key]));
	});

	// Map static files
	if (typeof options.files == "object") {
		Object.keys(options.files).sort().reverse().forEach(function(key) {
			site.get("/" + key, function(req, res) {
				return res.sendfile(options.files[key]);
			});
		});
	}

	// Serve favicon.ico
	site.use(express.favicon(options.favicon));

	var routes = require('./routes');
	routes.route(site,options,fs,User);
	
	// Get ready for sockets
	var io = require('socket.io').listen(site);
	var socket_handler = require('./socketio_handler');
	socket_handler.apply_to(io);

	// Actually listen
	site.listen(options.port, options.host);
});
