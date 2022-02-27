module.exports = (store, { socket }, data, callback) => {
	if (store.sessions[data.id]) {
		socket.join(data.id); // add the client to the session's socket room
		callback(true);
	} else {
		callback('Invalid ID');
	}
};