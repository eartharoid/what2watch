module.exports = (store, {
	io, socket
}) => {
	const sessionId = [...socket.rooms][1]; // convert the Set to an Array and get the second element (first is the socket ID)
	io.to(sessionId).emit('endSession');
};