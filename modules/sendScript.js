const toAeClient = require('./tcpClient');
const fs = require('fs');
const path = require('path');

module.exports = function(settings, msg) {
	let host = '127.0.0.1';
	let port = settings.port;
	if (msg.indexOf('jsx') != -1) {
		toAeClient(host, port, msg);
	} else {
		const parserXml = require('xml2json');
		let manifestStr = fs.readFileSync(path.resolve(path.dirname(msg), 'csxs/manifest.xml'), 'utf8');
		const manifest = JSON.parse(parserXml.toJson(manifestStr, { reversible: true }));
		let extId = manifest.ExtensionManifest.ExtensionList.Extension.Id;
		toAeClient(host, port, extId);
	}
};
