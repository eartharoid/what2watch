module.exports = (store, {
	io, socket
}) => {
	const sessionId = [...socket.rooms][1]; // convert the Set to an Array and get the second element (first is the socket ID)
	io.to(sessionId).emit('endSession'); // tell the clients in the session room to show the end screen
	delete store.sessions[sessionId]; // delete session data to prevent data building up in memory
};