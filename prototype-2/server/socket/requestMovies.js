const { MovieDb } = require('moviedb-promise');
const tmdb = new MovieDb(process.env.TMDB_API_KEY);

module.exports = async (store, {
	io,
	socket
}) => {
	const sessionId = [...socket.rooms][1]; // convert the Set to an Array and get the second element (first is the socket ID)

	let movies;

	const liked = Object.keys(store.sessions[sessionId].movies).filter(id => store.sessions[sessionId].movies[id] >= 2); // get liked movies from store

	if (liked.length >= 1) { // if there's at least 1 movie...
		let similar = [];
		for (let i = 0; i < Math.min(liked.length, 5); i++) { // loop over the `liked` array
			const random = Math.floor(Math.random() * liked.length); // select a random element
			similar = [
				...similar,
				...(await tmdb.movieSimilar({ id: liked[random] })).results.splice(0, 3) // fetch up to 3 similar movies
			]; // and merge the array into `similar`
		}

		similar.forEach(movie => {
			store.sessions[sessionId].data[String(movie.id)] = movie;
		}); // cache movie data

		movies = similar;
	} else {
		const params = {
			sort_by: 'popularity.desc', // get the most popular
			without_genres: store.sessions[sessionId].genresToExclude.join(',') // only include movies without these genres
		};

		const with_cast = Object.keys(store.sessions[sessionId].cast).filter(id => store.sessions[sessionId].cast[id] >= 2);
		if (with_cast.length >= 1) params.with_cast = with_cast.join(',');
		// TMDb API does not have a without_cast parameter

		const with_genres = Object.keys(store.sessions[sessionId].genres).filter(id => store.sessions[sessionId].genres[id] >= 2); // Math.ceil(store.sessions[sessionId].movies.length / store.sessions[sessionId].genres[id])
		const without_genres = Object.keys(store.sessions[sessionId].genres).filter(id => store.sessions[sessionId].genres[id] <= -1);
		if (without_genres.length !== 0 && with_genres.length > without_genres.length) params.with_genres = with_genres.join(','); // only include these genres
		else params.without_genres = [...store.sessions[sessionId].genresToExclude, ...without_genres].join(','); // or exclude these genres

		const with_keywords = Object.keys(store.sessions[sessionId].keywords).filter(id => store.sessions[sessionId].keywords[id] >= 2);
		const without_keywords = Object.keys(store.sessions[sessionId].keywords).filter(id => store.sessions[sessionId].keywords[id] <= -1);
		if (without_keywords.length !== 0 && with_keywords.length > without_keywords.length) params.with_keywords = with_keywords.join(','); // only include these keywords
		else params.without_keywords = without_keywords.join('|'); // or exclude these keywords (comma=AND, pipe=OR)

		movies = (await tmdb.discoverMovie(params)).results.splice(0, 10); // fetch movies from TMDB API using query params, limit to 10 movies max
		movies.forEach(result => {
			store.sessions[sessionId].data[String(result.id)] = result;
		}); // cache movie data

		if (movies.length === 1) {
			io.to(sessionId).emit('endSession', movies[0]);// end, only 1 movie
			return;
		} else if (movies.length === 0) {
			io.to(sessionId).emit('endSession');  // end, no movies
			return;
		}
	}

	for (const result of movies) {
		if (store.sessions[sessionId].data[String(result.id)]._cast === undefined) {
			store.sessions[sessionId].data[String(result.id)]._cast = (await tmdb.movieCredits({ id: result.id })).cast.splice(0, 25);
		}
	} // fetch credits for each movie, limit to 25

	for (const result of movies) {
		if (store.sessions[sessionId].data[String(result.id)]._keywords === undefined) {
			store.sessions[sessionId].data[String(result.id)]._keywords = (await tmdb.movieKeywords({ id: result.id })).keywords;
		}
	} // fetch keywords for each movie

	io.to(sessionId).emit('receiveMovies', movies); // send movies to all users in session
};