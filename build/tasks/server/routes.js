var _ = require('underscore')._;
var async = require("async");
var namer = require("./namer");

exports.route = function(site,options,fs,User) {

	site.get('/session/new', function(req, res) {
		// Generate a unique, random nickname for this unregistered user
		var name_is_unique = false;
		var name = namer.generate();	// @todo make sure the name is unique

		// Log this unregistered user in the users collection
		var user = new User();
		user.name = name;
		user.registered = false;
		user.save();

		// Store user_id in session
		req.session.user_id = user._id;

		// Respond with user_id
		res.json({user: user});
	});

	site.get('/session/destroy', function(req, res) {
		req.session.destroy();
		res.json({});
	});

	site.get('/session/user_id', function(req,res) {
		res.json({user_id: req.session.user_id});
	});

	site.get('/users/:id', function(req,res) {
		async.series([
			function(cb) {
				User.find({_id: req.params.id}, function(err, docs) {
					cb(err, docs);
				})
			}
			], function(err, results) {
				res.json(results[0][0]);
			});
	});

	site.put('/users/:id', function(req,res) {
		var id = req.body._id;
		delete req.body['_id'];
		User.update({_id: id}, req.body, {}, function(err) {
			if (err) { console.log(err); }
		});
	});

	// Ensure all other routes go home for the client side app
	site.get("*", function(req, res) {
		fs.createReadStream(options.index).pipe(res);
	});
};