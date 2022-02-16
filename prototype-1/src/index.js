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
		console.log('Genre IDs:', genresToExclude.join(', ') || 'none'); // dev: verify that the above worked by outputting genre IDs

		try {
			const store = {
				cast: {},
				genres: {},
				keywords: {}
			};
			main(store, {
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


async function voteCast(store, id, vote) {
	if (store.cast[id] === undefined) store.cast[id] = vote ? 1 : -1; // if it doesn't exist yet, set it to +1 or -1
	else store.cast[id] = vote ? store.cast[id]++ : store.cast[id]--; // add or subtract 1
}

async function voteGenre(store, id, vote) {
	if (store.genres[id] === undefined) store.genres[id] = vote ? 1 : -1;
	else store.genres[id] = vote ? store.genres[id]++ : store.genres[id]--;
}

async function voteKeyword(store, id, vote) {
	if (store.keywords[id] === undefined) store.keywords[id] = vote ? 1 : -1;
	else store.keywords[id] = vote ? store.keywords[id]++ : store.keywords[id]--;
}

async function main(store, {
	genresToExclude,
	region,
	services
}) {
	console.time('tdmb-api');
	console.log('Processing...');

	const params = {
		sort_by: 'popularity.desc', // get the most popular
		watch_region: region, // only include movies streamable in the user's region
		without_genres: genresToExclude.join(',') // only include movies without these genres
	};
	if (!services.includes(-1)) params.with_watch_providers = services.join(','); // if services doesn't include buying/renting, add services to query
	const results = (await tmdb.discoverMovie(params)).results.splice(0, 10); // fetch movies from TMDB API using query params, limit to 10 results max

	const cast = {};
	for (const result of results) cast[result.id] = (await tmdb.movieCredits({ id: result.id })).cast.splice(0, 25); // fetch credits for each movie, limit to 25

	const keywords = {};
	for (const result of results) keywords[result.id] = (await tmdb.movieKeywords({ id: result.id })).keywords; // fetch credits for each movie

	console.timeEnd('tdmb-api');

	inquirer
		.prompt(results.map(result => ({
			message: `Do you want to watch "${result.title}", starring ${cast[result.id][0]?.name} and ${cast[result.id][1]?.name}?`,
			name: result.id,
			type: 'confirm'
		})))
		.then(answers => {
			for (const movieId in answers) { // loop through each movie
				for (const { id } of cast[movieId]) voteCast(store, id, answers[movieId]); // update each actor
				if (genresToExclude.length !== 1) for (const id of results.find(result => result.id === Number(movieId)).genre_ids) voteGenre(store, id, answers[movieId]); // update each genre
				for (const { id } of keywords[movieId]) voteKeyword(store, id, answers[movieId]); // update each keyword
			}
		});
}