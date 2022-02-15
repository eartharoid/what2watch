const { readdirSync } = require('fs');
const { join } = require('path');
const events = readdirSync(join(__dirname, '/socket'))
	.filter(file => file.endsWith('.js'));

const fastify = require('fastify')();

fastify.register(require('fastify-cors'), { origin: true });

fastify.get('/', async () => 'The public facing app is at https://what2watch.eartharoid.me/');

fastify.listen(process.env.HTTP_PORT || 8080, (err, host) => {
	if (err) throw err;
	console.log(host);
});

const io_options = {};
if (process.env.NODE_ENV !== 'production') io_options.cors = { origin: [process.env.HTTP_HOST, 'http://localhost:8080', 'http://localhost:5000'] };

const socket = require('socket.io')(fastify.server, io_options);

socket.on('connection', async connection => {
	// const { auth } = socket.handshake;
	console.log('A client has connected to the socket');
	for (const event of events) {
		const {
			event: event_name,
			execute
		} = require(`./socket/${event}`);
		connection.on(event_name, (...args) => execute(connection, ...args));
	}
});