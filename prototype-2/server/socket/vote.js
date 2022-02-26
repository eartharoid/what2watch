module.exports = (store, { socket }, data, callback) => {
	const sessionId = [...socket.rooms][1]; // convert the Set to an Array and get the second element (first is the socket ID)

	function voteCast(id, vote) { // update a cast member
		if (store.sessions[sessionId].cast[id] === undefined) store.sessions[sessionId].cast[id] = vote ? 1 : -1; // if it doesn't exist yet, set it to +1 or -1
		else vote ? store.sessions[sessionId].cast[id]++ : store.sessions[sessionId].cast[id]--; // add or subtract 1
	}

	function voteGenre(id, vote) { // same as above
		if (store.sessions[sessionId].genres[id] === undefined) store.sessions[sessionId].genres[id] = vote ? 1 : -1;
		else vote ? store.sessions[sessionId].genres[id]++ : store.sessions[sessionId].genres[id]--;
	}

	function voteKeyword(id, vote) { // same as above
		if (store.sessions[sessionId].keywords[id] === undefined) store.sessions[sessionId].keywords[id] = vote ? 1 : -1;
		else vote ? store.sessions[sessionId].keywords[id]++ : store.sessions[sessionId].keywords[id]--;
	}

};