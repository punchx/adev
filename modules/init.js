//Init function
//Interactive cli process to create aebuild.json

const inquirer = require('inquirer');
const path = require('path');
const fs = require('fs');
const workDir = process.cwd();
const packagePath = path.join(workDir, 'adev-package.json');
const packageExists = fs.existsSync(packagePath);
const isWin = process.platform === 'win32';

const askQuestions = function() {
	//Questions on cli
	return inquirer.prompt([
		{
			name: 'appName',
			message: 'Enter app name:',
			default: ''
		},
		{
			name: 'version',
			message: 'Enter app version:',
			default: '0.1.0'
		},
		{
			type: 'list',
			name: 'type',
			message: 'Enter app type:',
			choices: ['script', 'extension']
		},
		{
			name: 'entryPoint',
			message: 'Enter app entry point:',
			default: 'script.jsx'
		},
		{
			type: 'number',
			name: 'port',
			message: 'port number',
			default: 1337
		},
		{
			name: 'authors',
			message: 'Enter authors:',
			default: ''
		},
		{
			name: 'email',
			message: 'Enter email adress:',
			default: ''
		}
	]);
};
const init = async function() {
	//Run questions function and wait till answer is resolved and function return an answer object
	const answers = await askQuestions();
	answers.build = {
		linter: true,
		uglify: false,
		binary: false
	};

	//Parse answers object and write it to the file
	let data = JSON.stringify(answers, null, 2);
	fs.writeFileSync(packagePath, data);
	process.exit(1);
};

module.exports = function() {
	//handle diffrent actions for situation when package file exitsts or not
	if (packageExists) {
		inquirer
			.prompt([
				{
					type: 'confirm',
					name: 'overwrite',
					message: 'File adev-package.json already exits. Replace it?'
				}
			])
			.then(answers => {
				if (answers.overwrite) {
					init();
				} else {
					process.exit(1);
				}
			});
	} else {
		init();
	}
};
