const store = { sessions: {} };

const { readdirSync } = require('fs');
const { join } = require('path');
const events = readdirSync(join(__dirname, '/socket'))
	.filter(name => name.endsWith('.js'))
	.map(name => name.split(/\./)[0]);

const fastify = require('fastify')();

fastify.register(require('fastify-cors'), { origin: true });

fastify.get('/', async () => 'The public facing app is at https://what2watch.eartharoid.me');

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
		const execute = require(`./socket/${event}.js`);
		connection.on(event, (...args) => execute(store, connection, ...args));
	}
});