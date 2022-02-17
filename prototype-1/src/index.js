require('dotenv').config();

const genres = require('../genres.json');
const { MovieDb } = require('moviedb-promise');
const tmdb = new MovieDb(process.env.TMDB_API_KEY);
const iso = require('iso-3166-1');
const inquirer = require('inquirer');

const serviceIDs = {
	'Amazon Prime Video': 119,
	'Buy or Rent': -1,
	'Disney Plus': 337,
	'Netflix': 8
};

let store;

inquirer
	.prompt([
		{
			default: 'GB',
			filter: input => iso.whereAlpha2(input)?.alpha2 || iso.whereAlpha3(input)?.alpha2 || iso.whereCountry(input)?.alpha2, // convert the input into the Alpha-2 format
			message: 'What is your region (ISO 3166-1 code)?',
			name: 'region',
			type: 'input',
			validate: input => iso.whereAlpha2(input) || iso.whereAlpha3(input) || iso.whereCountry(input) ? true : 'Invalid country code'
		},
		{
			choices: ['Netflix', 'Disney Plus', 'Amazon Prime Video', 'Buy or Rent'],
			message: 'Which services should be included?',
			name: 'services',
			type: 'checkbox'
		},
		{
			choices: genres.map(genre => genre.name),
			message: 'Which genres should be EXCLUDED?',
			name: 'genresToExclude',
			type: 'checkbox'
		}
	])
	.then(({
		genresToExclude,
		region,
		services
	}) => {
		console.log('The following services will be included in recommendations: %s (%s)', services.join(', ') || 'all', region); // output included service names
		services = services.map(name => serviceIDs[name]); // convert service names to IDs
		console.log('The following genres will be excluded from recommendations:', genresToExclude.join(', ') || 'none'); // output excluded genre names
		genresToExclude = genresToExclude.map(name => genres.find(genre => genre.name === name).id); // convert genre names to IDs
		// console.log('Genre IDs:', genresToExclude.join(', ') || 'none'); // dev: verify that the above worked by outputting genre IDs

		try {
			store = {
				cast: {},
				data: {},
				genres: {},
				keywords: {},
				movies: {}
			};
			main({
				genresToExclude,
				region,
				services
			});
		} catch (error) {
			console.log('Fatal error:', error);
		}

	})
	.catch(error => {
		if (error.isTtyError) {
			console.log('Unsupported environment.');
		} else {
			console.error('Error:', error);
		}
	});


function voteCast(id, vote) {
	if (store.cast[id] === undefined) store.cast[id] = vote ? 1 : -1; // if it doesn't exist yet, set it to +1 or -1
	else vote ? store.cast[id]++ : store.cast[id]--; // add or subtract 1
}

function voteGenre(id, vote) {
	if (store.genres[id] === undefined) store.genres[id] = vote ? 1 : -1;
	else vote ? store.genres[id]++ : store.genres[id]--;
}

function voteKeyword(id, vote) {
	if (store.keywords[id] === undefined) store.keywords[id] = vote ? 1 : -1;
	else vote ? store.keywords[id]++ : store.keywords[id]--;
}

async function ask(movies, {
	genresToExclude,
	region,
	services
}) {
	for (const result of movies) {
		if (store.data[String(result.id)]._cast === undefined) {
			store.data[String(result.id)]._cast = (await tmdb.movieCredits({ id: result.id })).cast.splice(0, 25);
		}
	} // fetch credits for each movie, limit to 25

	for (const result of movies) {
		if (store.data[String(result.id)]._keywords === undefined) {
			store.data[String(result.id)]._keywords = (await tmdb.movieKeywords({ id: result.id })).keywords;
		}
	} // fetch keywords for each movie

	inquirer
		.prompt(movies.map(result => ({
			message: `Do you want to watch "${result.title}", starring ${store.data[String(result.id)]._cast[0]?.name} and ${store.data[String(result.id)]._cast[1]?.name}?`,
			name: result.id,
			type: 'confirm'
		})))
		.then(answers => {
			for (const movieId in answers) { // loop through each movie
				if (store.movies[movieId] === undefined) store.movies[movieId] = answers[movieId] ? 1 : -1; // if it doesn't exist yet, set the movie to +1 or -1
				else answers[movieId] ? store.movies[movieId]++ : store.movies[movieId]--; // otherwise add or subtract 1 to the movie

				for (const { id } of store.data[movieId]._cast) voteCast(id, answers[movieId]); // update each actor
				if (genresToExclude.length !== 1) for (const id of movies.find(result => result.id === Number(movieId)).genre_ids) voteGenre(id, answers[movieId]); // update each genre
				for (const { id } of store.data[movieId]._keywords) voteKeyword(id, answers[movieId]); // update each keyword
			}

			const recommended = movies.filter(result => store.movies[String(result.id)] >= 3); // find movies that have a better score

			if (recommended.length >= 1) {
				console.log('Try one of these movies:');
				console.log(recommended.map(movie => `(${movie.vote_average}/10) ${movie.title}: ${movie.overview.substr(50)}...`).join('\n\n')); // output movie list
				inquirer
					.prompt([
						{
							message: 'Stop (yes) or continue matching (no)?',
							name: 'end',
							type: 'confirm'
						}
					])
					.then(({ end }) => {
						if (end) {
							console.log('Enjoy your movie!');
						} else {
							main({
								genresToExclude,
								region,
								services
							}); // recursively continue
						}
					});
			} else {
				main({
					genresToExclude,
					region,
					services
				}); // recursively continue
			}
		});
}

async function main({
	genresToExclude,
	region,
	services
}) {
	console.log('Processing...');

	const liked = Object.keys(store.movies).filter(id => store.movies[id] >= 2); // get liked movies from store

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
			store.data[String(movie.id)] = movie;
		}); // cache movie data

		ask(similar, {
			genresToExclude,
			region,
			services
		});
	} else {
		const params = {
			sort_by: 'popularity.desc', // get the most popular
			watch_region: region, // only include movies streamable in the user's region
			without_genres: genresToExclude.join(',') // only include movies without these genres
		};

		if (!services.includes(-1)) params.with_watch_providers = services.join(','); // if services doesn't include buying/renting, add services to query

		const with_cast = Object.keys(store.cast).filter(id => store.cast[id] >= 2);
		if (with_cast.length >= 1) params.with_cast = with_cast.join(',');
		// TMDb API does not have a without_cast parameter

		const with_genres = Object.keys(store.genres).filter(id => store.genres[id] >= 2); // Math.ceil(store.movies.length / store.genres[id])
		const without_genres = Object.keys(store.genres).filter(id => store.genres[id] <= -1);
		if (without_genres.length !== 0 && with_genres.length > without_genres.length) params.with_genres = with_genres.join(','); // only include these genres
		else params.without_genres = [...genresToExclude, ...without_genres].join(','); // or exclude these genres

		const with_keywords = Object.keys(store.keywords).filter(id => store.keywords[id] >= 2);
		const without_keywords = Object.keys(store.keywords).filter(id => store.keywords[id] <= -1);
		if (without_keywords.length !== 0 && with_keywords.length > without_keywords.length) params.with_keywords = with_keywords.join(','); // only include these keywords
		else params.without_keywords = without_keywords.join('|'); // or exclude these keywords (comma=AND, pipe=OR)

		const movies = (await tmdb.discoverMovie(params)).results.splice(0, 10); // fetch movies from TMDB API using query params, limit to 10 movies max
		movies.forEach(result => {
			store.data[String(result.id)] = result;
		}); // cache movie data

		if (movies.length === 1) return console.log(`There's only movie left: ${movies[0].title}`); // end, only 1 movie
		else if (movies.length === 0) return console.log('You\'ve run out of movies :('); // end, no movies

		ask(movies, {
			genresToExclude,
			region,
			services
		});
	}


}