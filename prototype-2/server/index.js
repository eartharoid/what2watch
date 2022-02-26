require('dotenv').config();

const store = { sessions: {} }; // the session store

const { readdirSync } = require('fs');
const { join } = require('path');
const events = readdirSync(join(__dirname, '/socket')) // read directory
	.filter(name => name.endsWith('.js')) // filter array to only include JS files
	.map(name => name.split(/\./)[0]); // get the file names without extensions (remove `.js`)

const fastify = require('fastify')();
fastify.register(require('fastify-cors'), { origin: true }); // allow CORS

fastify.register(require('fastify-static'), { root: join(__dirname, '../public') }); // serve static files from public directory

fastify.listen(process.env.HTTP_PORT || 8080, (err, host) => {
	if (err) throw err;
	console.log(host);
}); // start the HTTP server

const io_options = { cors: { origin: [process.env.HTTP_HOST, 'http://localhost:8080'] } }; // set origins for CORS

const io = require('socket.io')(fastify.server, io_options); // start IO with the fastify HTTP server

io.on('connection', async socket => {
	console.log('A client has connected to the socket');
	for (const event of events) {
		const execute = require(`./socket/${event}.js`); // import the function
		socket.on(event, (...args) => execute(store, {
			io,
			socket
		}, ...args)); // on event, execute function
	}
});