const genres = require('./prototype-1/genres.json');

console.log(
	genres
		.map(genre => `<option value="${genre.id}">${genre.name}</option>`)
		.join('\n')
);