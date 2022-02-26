const crypto = require('crypto');

module.exports = (store, { socket }, data, callback) => {
	const id = crypto.randomBytes(3).toString('hex');
	store.sessions[id] = {
		cast: {},
		data: {},
		genres: {},
		genresToExclude: data.genres,
		keywords: {},
		movies: {}
	};
	socket.join(id);
	callback(id);
};