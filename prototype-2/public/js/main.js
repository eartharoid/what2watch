const socket = io();

socket.on('connect', () => {
	console.log(socket.id);
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
				const element = document.getElementById('pid_join_error');
				element.innerHTML = response;
			}
		});
	} else {
		showPage('pid_join');
	}
}