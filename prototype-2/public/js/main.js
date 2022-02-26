let sessionId = null;
let movies = null;

const socket = io();

socket.on('connect', () => {
	console.log('socket#:', socket.id);
});

socket.on('receiveMovies', _movies => {
	console.log(movies);
	movies = _movies;
	showPage('pid_vote');
	askVote(movies[0]);
});

socket.on('endSession', movie => {
	if (movie) {
		showPage('pid_end_with_movie');
		const element = document.getElementById('eid_end_last_movie');
		element.innerHTML = movie.title; // output error
	} else {
		showPage('pid_end');
	}
});

function showPage(id) {
	const app = document.getElementById('app');
	for (let child = 0; child < app.children.length; child++) app.children[child].style.display = 'none'; // hide other pages
	document.getElementById(id).style.display = 'block'; // show the desired page
}

function joinSession(id) {
	if (id) {
		console.log(id);
		socket.emit('joinSession', { id }, response => {
			if (response === true) {
				// do something
			} else {
				const element = document.getElementById('eid_join_error');
				element.innerHTML = response; // output error
			}
		});
	} else {
		showPage('pid_join');
	}
}

function startSession(event) {
	showPage('pid_loading');
	event.preventDefault(); // prevent form submission
	const data = new FormData(event.target); // get the form data object
	const genres = [];
	data.forEach(value => genres.push(value)); // as the form only has 1 field, this super simple for-loop works for getting all of the `genres` entries
	socket.emit('startSession', { genres }, response => {
		sessionId = response;
		socket.emit('requestMovies'); // ask for movies
	});
}

function askVote(movie) {
	document.getElementById('app').style.backgroundImage = `linear-gradient(to bottom, rgba(0, 0, 0, 1.0), rgba(0, 0, 0, 0.5)), url("https://www.themoviedb.org/t/p/w1920_and_h800_multi_faces${movie.backdrop_path}")`;
	document.getElementById('eid_vote_img').src = `https://www.themoviedb.org/t/p/w600_and_h900_bestv2${movie.poster_path}`;
	document.getElementById('eid_vote_title').innerText = movie.title;
	document.getElementById('eid_vote_rating').innerText = `${movie.vote_average}/10`;
	document.getElementById('eid_vote_description').innerText = movie.overview;
}

function voteYes() {}

function voteNo() {}