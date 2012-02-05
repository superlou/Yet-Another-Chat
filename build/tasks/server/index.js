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
	var fs = require("fs");
	var express = require("express");
	var site = express.createServer();

	site.use(express.bodyParser());

	// Set up session store
	site.use(express.cookieParser());

	var MemStore = express.session.MemoryStore; // ONLY FOR DEVELOPMENT!

	site.use(express.session({secret: "apples", store: MemStore({
		reapInterval: 60000*10
	})}));

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

	// Ensure all routes go home, client side app..

	site.get('/session/username.json', function(req, res) {
		res.json({username: req.session.username});
	});

	site.post('/session/request_username.json', function(req,res) {
		var requested_username = req.body.username;
		req.session.username = requested_username;
		res.json({username: requested_username});
	});

	site.get("*", function(req, res) {	// MUCKED WITH THIS TO MESS WITH SESSION
		fs.createReadStream(options.index).pipe(res);
	});
	
	// Get ready for sockets
	var io = require('socket.io').listen(site);

	io.sockets.on('connection', function(socket) {
		socket.on('enter_room', function(data) {
			socket.join(data.room);
		});

		socket.on('user_message', function(data) {
			io.sockets.in(data.room_id).emit('room_message', data);
		});
	});

	// Actually listen
	site.listen(options.port, options.host);
});
