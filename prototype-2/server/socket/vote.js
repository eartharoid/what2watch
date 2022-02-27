module.exports = (store, { socket }, data) => {
	const sessionId = [...socket.rooms][1]; // convert the Set to an Array and get the second element (first is the socket ID)

	function voteCast(id, vote) { // update a cast member
		if (store.sessions[sessionId].cast[id] === undefined) store.sessions[sessionId].cast[id] = vote ? 1 : -1; // if it doesn't exist yet, set it to +1 or -1
		else vote ? store.sessions[sessionId].cast[id]++ : store.sessions[sessionId].cast[id]--; // add or subtract 1
	}

	function voteGenre(id, vote) { // same as above, update a genre
		if (store.sessions[sessionId].genres[id] === undefined) store.sessions[sessionId].genres[id] = vote ? 1 : -1;
		else vote ? store.sessions[sessionId].genres[id]++ : store.sessions[sessionId].genres[id]--;
	}

	function voteKeyword(id, vote) { // same as above, update a keyword
		if (store.sessions[sessionId].keywords[id] === undefined) store.sessions[sessionId].keywords[id] = vote ? 1 : -1;
		else vote ? store.sessions[sessionId].keywords[id]++ : store.sessions[sessionId].keywords[id]--;
	}

	if (store.sessions[sessionId].movies[data.id] === undefined) store.sessions[sessionId].movies[data.id] = data.vote ? 1 : -1; // if it doesn't exist yet, set the movie to +1 or -1
	else data.vote ? store.sessions[sessionId].movies[data.id]++ : store.sessions[sessionId].movies[data.id]--; // otherwise add or subtract 1 to the movie

	for (const { id } of store.sessions[sessionId].data[data.id]._cast) voteCast(id, data.vote); // update each actor
	if (store.sessions[sessionId].genresToExclude.length !== 1) { // only if there's multiple excluded genres
		for (const id of store.sessions[sessionId].data[data.id].genre_ids) voteGenre(id, data.vote); // update each genre
	}
	for (const { id } of store.sessions[sessionId].data[data.id]._keywords) voteKeyword(id, data.vote); // update each keyword
};