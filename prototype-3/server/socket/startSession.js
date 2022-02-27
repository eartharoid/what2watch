const crypto = require('crypto');

module.exports = (store, { socket }, data, callback) => {
	const id = crypto.randomBytes(3).toString('hex'); // generate a random 6-character session ID
	store.sessions[id] = {
		cast: {},
		clients: [socket.id],
		data: {},
		finishedVoting: [],
		genres: {},
		genresToExclude: data.genres,
		keywords: {},
		movies: {}
	}; // set the session data structure
	socket.join(id); // join (and create) the session's socket room
	callback(id); // return the socket ID to be displayed to the user
};