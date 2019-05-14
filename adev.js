#!/usr/bin/env node
const app = require('commander');
const path = require('path');
const fs = require('fs');
const package = require('./package.json');
const init = require('./modules/init');
const isWin = process.platform === 'win32';
const workDir = process.cwd();
const packagePath = path.join(workDir, 'adev-package.json');
const packageExists = fs.existsSync(packagePath);
let entryPoint = '';
let settings = { type: 'script', port: 1337 };

//Parse app arguments with commander
app
	.version(package.version, '-v, --version')
	.option('-i, --init', 'Init adev-package.json')
	.option('-w, --watcher [path]', 'Start watcher')
	.option('-r, --release [path]', 'Build release version')
	.option('-b, --binary', 'Compile to binary')
	.option('-d, --debug <action>', 'Activate debug mode')
	.option('-m, --makefile', 'Concat all includes in main file')
	.parse(process.argv);

//Make script path for single file or entry point of project

if (
	(process.argv[2] && path.extname(process.argv[2]).indexOf('jsx') != -1) ||
	(process.argv[2] && path.extname(process.argv[2]).indexOf('html') != -1) ||
	(app.watcher && app.watcher != true) ||
	(app.production && app.production != true)
) {
	entryPoint = path.resolve(app.watcher || app.production || process.argv[2]);
} else if (packageExists) {
	settings = require(packagePath);
	if (settings && settings.entryPoint) {
		entryPoint = path.resolve(path.join(workDir, settings.entryPoint.trim()));
	}
}

//Add backslashes if is windows
entryPoint = isWin ? entryPoint.replace(/\\/g, '\\\\') : entryPoint;
//Handle diffrent arguments actions
if (app.init) {
	init();
} else if (!packageExists) {
	const inquirer = require('inquirer');
	inquirer
		.prompt([
			{
				type: 'confirm',
				name: 'create',
				message: 'File adev-package.json was not found in this directiry. Do You want to create it?'
			}
		])
		.then(answers => {
			if (answers.create) {
				init();
			} else {
				process.exit();
			}
		});
} else {
	if (app.watcher) {
		const watcher = require('./modules/watcher');
		if (app.watcher != true) {
			watcher(entryPoint, settings, entryPoint);
		} else {
			watcher(workDir, settings, entryPoint);
		}
	} else if (app.release) {
		const release = require('./modules/release');
		release(settings, entryPoint);
	} else if (app.extension) {
		console.log('initiate extension project');
	} else if (app.debug) {
		const debug = require('./modules/setDebugMode');
		if (app.debug == 'enable') debug.enableDebugMode();
		else if (app.debug == 'disable') debug.disableDebugMode();
		else console.log('Not valid [ %s ] command!', app.debug);
	} else {
		const run = require('./modules/sendScript');
		run(settings, entryPoint);
	}
}
