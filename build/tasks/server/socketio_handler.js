var _ = require('underscore')._;

exports.apply_to = function(io) {
	io.sockets.on('connection', function(socket) {
		socket.on('enter_room', function(data) {
			socket.join(data.room);

			// Notify everyone else in the room that someone has joined
			socket.get('user_id', function(err, user_id) {
				socket.broadcast.to(data.room_id).emit(
					'attendee_join', {room_id: data.room, user_id: user_id}
				);
			});
		});

		socket.on('request_attendees', function(data) {
			// Build a list of users in a room and send
			var user_ids = [];

			_.each(io.sockets.clients(data.room_id), function(socket) {
				socket.get('user_id', function(err, user_id) {
					user_ids.push(user_id);
				});
			});

			socket.emit('attendee_list',{room_id: data.room_id, user_ids: user_ids});
		});

		socket.on('user_change', function(data) {
			// Determine which rooms this user is in
			var rooms = _.keys(socket.manager.rooms);
			
			// Emit events asking users to trigger a change
			_.each(rooms, function(room) {
				io.sockets.in(room).emit('user_changed',{user_id: data.user_id});
			});
		});

		socket.on('disconnect', function() {
			socket.get('user_id', function(err, user_id) {
				io.sockets.emit('attendee_disconnect', {user_id: user_id});
			});
		});

		socket.on('user_message', function(data) {
			io.sockets.in(data.room_id).emit('room_message', data);
		});

		socket.on('set_user_id', function(data) {
			socket.set('user_id', data);
		});
	});
};