const child_process = require('child_process');
const path = require('path');
const isWin = process.platform === 'win32';

module.exports = { enableDebugMode, disableDebugMode };

function enableDebugMode() {
	if (isWin) {
		child_process.exec(path.resolve(__dirname, 'cmd-files/enableDebug.bat'), (err, stdout, stderr) => {
			console.log(`stdout: ${stdout}`);
		});
	}
}

function disableDebugMode() {
	if (isWin) {
		child_process.exec(path.resolve(__dirname, 'cmd-files/disableDebug.bat'), (err, stdout, stderr) => {
			console.log(`stdout: ${stdout}`);
		});
	}
}
