module.exports = (store, {
	io,
	socket
}) => {
	const sessionId = [...socket.rooms][1]; // convert the Set to an Array and get the second element (first is the socket ID)

	store.sessions[sessionId].finishedVoting.push(socket.id); // add client's iD to the array

	if (store.sessions[sessionId].finishedVoting.length === store.sessions[sessionId].clients.length) { // if everyone has finished voting
		io.to([...socket.rooms][0]).emit('readyToContinue'); // tell the session leader's client to continue
		store.sessions[sessionId].finishedVoting = []; // reset array for next cycle
	}
};