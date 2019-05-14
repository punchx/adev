const net = require('net');

//TCP client for sending message to extension server,
//Recieve answers, split them to messages and print to console
module.exports = function(host, port, msg) {
	var buffered = '';
	const client = new net.Socket();
	client.connect(port, host, function() {
		client.write(msg);
	});

	client.on('data', function(data) {
		buffered += data;
		msgSplit();
	});

	client.on('error', function(err) {
		console.log(err);
	});

	client.on('close', function() {});

	function msgSplit() {
		var rec = buffered.split('\0');

		while (rec.length > 1) {
			if (rec[0] == '###End###') {
				client.destroy();
				return;
			}
			console.log(rec[0]);
			buffered = rec.slice(1).join('\0');
			rec = buffered.split('\0');
		}
	}
};
