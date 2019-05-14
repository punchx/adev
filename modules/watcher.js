//Watcher function
//Will execute script everytime something change in file or in project files
const chokidar = require('chokidar');
const run = require('./sendScript');

module.exports = function(path, settings, scriptPath) {
	console.log('Started watcher on: ' + path);
	chokidar.watch(path).on('change', function(event, path) {
		run(settings, scriptPath);
	});
};
