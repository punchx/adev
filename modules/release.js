const fs = require('fs');
const path = require('path');
var { exec } = require('child_process');
const Linter = require('eslint').Linter;
const linterConfig = require('./eslintConfig');
var UglifyJS = require('uglify-js');

const makeFile = require('./makefile').build;

module.exports = function(settings, entryPoint) {
	if (settings.type && settings.type.toLowerCase().trim() == 'script') {
		let release = new Release();
		if (!settings.build)
			settings.build = { binary: true, linter: true, uglify: true };
		let fileName = path.basename(entryPoint);
		release
			.in(entryPoint)
			.makeFile()
			.writeToFile('concat-' + fileName)
			.lint(settings);
		if (settings.build.uglify === true) {
			release.uglify().writeToFile('min-' + fileName);
		}
		if (settings.build.binary === true) release.compile(fileName + 'bin');
	} else if (
		settings.type &&
		settings.type.toLowerCase().trim() == 'extension'
	) {
	}

	// if (settings.type && settings.type.toLowerCase().trim() == 'extension')
	//-build extension cli extension manager...
};

function Release() {}

Release.prototype.in = function(entryPoint) {
	if (!entryPoint) return this;
	this.entryPoint = entryPoint;
	this.buildFolder = path.resolve(path.dirname(this.entryPoint), 'build');
	this.scriptStr = fs.readFileSync(entryPoint, 'utf8');
	return this;
};

Release.prototype.writeToFile = function(fileName) {
	if (!fs.existsSync(this.buildFolder)) fs.mkdirSync(this.buildFolder);
	let filePath = path.resolve(this.buildFolder, fileName);
	fs.writeFile(filePath, this.scriptStr, err => {
		if (err) throw err;
	});
	this.lwFile = filePath;
	return this;
};

Release.prototype.makeFile = function() {
	if (!this.entryPoint) return;
	this.scriptStr = makeFile(this.entryPoint);
	return this;
};

Release.prototype.lint = function(settings) {
	if (!settings.build || !settings.build.linter) return this;
	let linter = new Linter();

	const messages = linter.verify(this.scriptStr, linterConfig, {
		filename: this.entryPoint
	});
	printErr(messages, this.lwFile);
	return this;
};

Release.prototype.uglify = function() {
	let options = {
		compress: {
			drop_console: true,
			drop_debugger: true
		},
		output: { quote_style: 1 }
	};
	this.scriptStr = UglifyJS.minify(this.scriptStr, options).code;
	return this;
};

Release.prototype.compile = function(fileName) {
	isWin = process.platform === 'win32';
	let tempFile = path.resolve(this.buildFolder, 'temp-compile.jsx');
	let binOutputFile = path.resolve(this.buildFolder, fileName);
	binOutputFile = isWin ? binOutputFile.replace(/\\/g, '\\\\') : binOutputFile;
	if (!fs.existsSync(this.buildFolder)) fs.mkdirSync(this.buildFolder);
	let script =
		`#target estoolkit#dbg\n\
var source = "` +
		this.scriptStr +
		`";\n\
var bin = app.compile(source);\n\
var fOut = File("` +
		binOutputFile +
		`");\n\
fOut.open("w");\n\
fOut.write(bin);`;
	fs.writeFileSync(tempFile, script);
	var cp = exec('"ExtendScript Toolkit" -cmd ' + tempFile, function(err) {
		console.log(err);
	});

	cp.on('close', function() {
		fs.unlinkSync(tempFile);
		process.exit();
	});
	return this;
};

function printErr(errmsg, file) {
	for (let i = 0; i < errmsg.length; i++) {
		console.log(
			file +
				' [line: ' +
				errmsg[i].line +
				'] ' +
				'Error' +
				': "' +
				errmsg[i].message +
				'"'
		);
	}
}
