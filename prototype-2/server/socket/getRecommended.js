module.exports = async (store, {
	io,
	socket
}) => {
	const sessionId = [...socket.rooms][1]; // convert the Set to an Array and get the second element (first is the socket ID)
	const recommended = Object.values(store.sessions[sessionId].data) // convert object to array of values
		.filter(result => store.sessions[sessionId].movies[String(result.id)] >= 3); // find movies that have a better score
	io.to(sessionId).emit('receiveRecommended', recommended); // send movies to all users in session
};