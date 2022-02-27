module.exports = (store, { socket }, data, callback) => {
	if (store.sessions[data.id]) {
		socket.join(data.id); // add the client to the session's socket room
		store.sessions[data.id].clients.push(socket.id); // add this client's ID to the clients array
		callback(true);
	} else {
		callback('Invalid ID');
	}
};