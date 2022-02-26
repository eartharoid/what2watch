module.exports = (store, { socket }, data, callback) => {
	if (store.sessions[data.id]) {
		socket.join(data.id);
		callback(true);
	} else {
		callback('Invalid ID');
	}
};