module.exports = async (store, { socket }, callback) => {
	const sessionId = [...socket.rooms][1]; // convert the Set to an Array and get the second element (first is the socket ID)
	const recommended = [...new Set(
		Object.values(store.sessions[sessionId].data) // convert object to array of values
			.filter(result => store.sessions[sessionId].movies[String(result.id)] >= 3) // find movies that have a better score
	)]; // remove duplicates by converting to a Set and back to an Array
	callback(recommended); // return movies
};