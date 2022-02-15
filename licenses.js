const licenses = require('./licenses.json');

for (const pkg in licenses) {
	const name = pkg.split(/@/g)[0];
	if (name.startsWith('prototype-')) continue;
	console.log(`${name}${licenses[pkg].publisher ? ` by ${licenses[pkg].publisher}` : ''} (https://www.npmjs.com/package/${name})`);
}