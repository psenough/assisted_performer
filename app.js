
//
// express dependencies
//

var net = require('net');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var fs = require('fs');
var http = require('http');
var request = require('request');
var parseString = require('xml2js').parseString;
var app = express();



//
// init express
//

var httpServer = http.createServer(app);

httpServer.listen(8080); // on windows 8, we need to call httpServer.listen(80,'172.17.0.20');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));



//
// init global vars used by express
//

var connections = [];
var connection_timeout = 2000;
var streaming_milliseconds = 50;
var votes = [];
var logdir = '';
var ourclient = null;
var gamedata = '0||||';



//
// express request handling
//

// serve controller page
app.get('/', catchall);
app.get('/controller', catchall);
app.get('/slider', catchall);
function catchall(req, res) {
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

	// get timestamp
	var d = new Date();
	var n = d.getTime();
	var thistime = d.toISOString().replace(/T/, ' ').replace(/\..+/, '');

	// check if IP is already listed and with a properly assigned parameter
	var found = false;
	for (var i=0; i<connections.length; i++) {
		console.log('connections list: ' + i + ' :: ' + connections[i]['ip']);
		// ip needs to be the same
		if (ip == connections[i]['ip']) {
			// param assigned needs to exist in list of valid params
			var parapara = false;
			for (p in params) {
				if ('params' in connections[i]) {
					//console.log('params in ' + connections[i]['ip'] + ' ' + connections[i]['params']);
					for (p2 in connections[i]['params']) {
						//console.log('comparing ' + connections[i]['params'][p2] + ' with ' + p);
						if (connections[i]['params'][p2] == p) {
							found = true;
							connections[i]['lasttime'] = n;
							parapara = true;
						}
					}
				}
			}
			if (!parapara) connections.splice(i, 1);
			break;
		}
	}
	
	// if we are dealing with a new IP, give it an unused param
	if (!found)
	{
		var param = getUntakenParam();
		
		// add the info to our connections records
		// params is an array because we might want to pass multiple parameters to a controller at some point
		connections.push({ip: ip, params: [param], lasttime: n});
		console.log('ip: ' + ip + ' now controlling param ' + param + ', total connections: ' + connections.length);
	}

	res.render('assisted_performer_slider', {title: 'Assisted Performer Slider'});
}

// serve canvas page
app.get('/canvas', canvas);
function canvas(req, res) {
	res.render('canvas', {title: 'Assisted Performer Canvas'});
	// not adding our canvas to the connections list
}

// serve favicon
app.get('/favicon.ico', function(req, res){
	var options = {
		root: __dirname + '/public/',
		dotfiles: 'deny',
		headers: {
			'x-timestamp': Date.now(),
			'x-sent': true
		}
	};
	var fileName = 'images/favicon.ico';
	res.sendFile(fileName, options, function (err) {
		if (err) {
		  console.log(err);
		  res.status(err.status).end();
		} else {
		  //console.log('Sent:', fileName);
		}
	});
	res.attachment(fileName);
});

// receive control values to affect parameter
app.post('/control', function(req, res) {
	// get timestamp
	var d = new Date();
	var n = d.getTime();

	var thisparam = req.body.param;
	var thistype = req.body.type;
	
	if (thisparam in params) {
		//var step = (params[thisparam]['max'] - params[thisparam]['min']) / 20;
		switch(thistype) {
			case 'add':
				params[thisparam]['value'] += params[thisparam]['step'];
				if (params[thisparam]['value'] > params[thisparam]['max']) params[thisparam]['value'] = params[thisparam]['max'];
			break;
			case 'minus':
				params[thisparam]['value'] -= params[thisparam]['step'];
				if (params[thisparam]['value'] < params[thisparam]['min']) params[thisparam]['value'] = params[thisparam]['min'];
			break;
			default:
				console.log('weird type received:'+thistype);
			break;
		}
		
		// update param on canvas via websockets
		sendWebSocketUpdateToCanvas(thisparam);
	}

	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	for (var i=0; i<connections.length; i++) {
		if (ip == connections[i]['ip']) {
			connections[i]['lasttime'] = n;
			break;
		}
	}

	res.send('rcvd|'+gamedata);
});

app.post('/ping', function(req, res) {
	// get timestamp
	var d = new Date();
	var n = d.getTime();
	var thistime = d.toISOString().replace(/T/, ' ').replace(/\..+/, '');
	var lastpingtime = req.body.lastpingtime || '';
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	for (var i=0; i<connections.length; i++) {
		if (ip == connections[i]['ip']) {
			var team = connections[i]['team'];

			// if we are returning to the land of the living, notify the dns poisoning that it's back
			if (n - connections[i]['lasttime'] > connection_timeout) {
				// notify the dns poisoning (add)
				//getSomething('172.17.0.10', 81, '/status/poison.php?add='+(ip.split(':'))[3]);
				//saveConnectionLog(ip+','+thistime+',return,'+team+','+connections.length);
				//winston.log('info', ip+',return,'+team+','+connections.length);
			}

			// update the timestamp
			connections[i]['lasttime'] = n;

			// already did what we wanted to do on this loop, go do other stuff
			break;
		}
	}

	//savePingLog(ip+','+thistime+','+lastpingtime);
	//winston.log('info', ip+',pingtime,'+lastpingtime);

	//console.log('ping');
	res.setHeader("Assisted-Performer", JSON.stringify(params));
	res.send('rcvd');
});

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      logme('Port ' + port + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logme('Port ' + port + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
	logme('Listening on port ' + server.address().port);
}

app.use(catchall);

app.set('port', process.env.port);
app.listen(app.get('port'));

app.on('error', onError);
app.on('listening', onListening);



//
// global functions 
//

function getTimestamp() {
	return (new Date()).getTime();
}

function removeTakenParamFromClosingIP(thisip) {
	//console.log('ip: ' + thisip);
	for (c in connections) {
		//console.log('connection: ' + connections[c]['ip'] + ' ' + thisip);
		if (connections[c]['ip'] == thisip) {
			if ('params' in connections[c]) {
				//console.log(connections[c]['params']);
				for (p in connections[c]['params']) {
					console.log('removing ' + connections[c]['params'][p] + ' from taken list');
					if (connections[c]['params'][p] in params) {
						delete params[connections[c]['params'][p]]['taken'];
					}
				}
				break;
			}
		}
	}
}

function getUntakenParam() {
	var param = null;
	for (p in params) {
		var istaken = false;
		//loop1:
		for (c in connections) {
			if ('params' in connections[c]) {
				//console.log(connections[c]['params']);
				for (p2 in connections[c]['params']) {
					//console.log('prata: ' + connections[c]['params'][p2] + ' ' + p);
					if (connections[c]['params'][p2] == p) {
						istaken = true;
						//break loop1;
					}
				}
			}
		}
		if (!istaken) return p;
	}
	return param;
}



//
// logging
//

function logme(thistext) {
	console.log(thistext);
}

function saveVoteLog(message) {
	saveLog('vote.log',message);
}

function saveConnectionLog(message) {
	saveLog('conn.log',message);
}

function savePingLog(message) {
	saveLog('ping.log',message);
}

function saveLog(filename, message) {
	if (logdir != '') {
		try {
			fs.mkdirSync(logdir);
		} catch(e) {
			if ( e.code != 'EEXIST' ) throw e;
		}
	}

	fs.appendFile(logdir+filename, message+'\n', function (err) {
	  if (err) throw err;
	  //console.log('The "data to append" was appended to file!');
	});
}



/*
var midi = require('midi');

// Set up a new output.
var output = new midi.output();

for (var i=0; i<output.getPortCount(); i++) {
	// Get the name of a specified output port.
	console.log(output.getPortName(i));
}

output.openPort(1);

// Send a MIDI message.
output.sendMessage([176,22,1]);

// Close the port when done.
output.closePort();
*/

/*
function openMidi(thisname) {
	outputmidi = new easymidi.Output(thisname);
}

function sendMidi() {
	if (outputmidi != null) {
		for (var i=0; i<127; i++) {
			console.log(i);
			outputmidi.send('cc', {
			  controller: 37,
			  value: i,
			  channel: 0
			});
		}
	}
}

function closeMidi() {
	output.close();
}
*/



//
// websockets
//

var ws = require('websocket.io');
var server = ws.listen(3001);

var active_conn = [];
var id = 0;
var params = {};

server.on('connection', function (client) {
    client.id = id++;
	client.ra = client.req.connection.remoteAddress;

	//console.log(client.req.connection.remoteAddress);
    client.send(JSON.stringify({'uniqueID': '2'}));
    active_conn.push({'uid': client.id, 'socket': client, 'latest_message': {}, 'client_type': null, 'latest_timestamp': getTimestamp()});
    logme('new ws connection from: ' + client.ra);
	logme('total ws active conns: ' + active_conn.length);

    client.on('message', function (data) {
		//logme('got something');
        //logme('received: ' + data);
		//logme('received something');

		var lmsg = data;
		var type = null;
		
		// crashes trying to parse, ignore
		var parsed;
		try {
			parsed = JSON.parse(data);
		} catch (e) {
			//logme('received with bad json format: ' + data);
			console.error(e);
			return;
		}

		// fails to parse, ignore
		if (!parsed) {
			logme('received with bad json format2: ' + data);
			return;
		} else {
			
			if (!('assisted_performer' in parsed)) {
				//logme('no assisted performer object found in parse: ' + data);
				
				// might be an opentsps object
				checkTSPS(parsed);
				
				return;
			}
			
			switch (parsed['assisted_performer']) {
				case 'canvas':
					params = parsed['parameters'];
					type = 'canvas';
					logme('received: ' + data);
					//TODO: when received message with new parameters, should reassign on all existing connections
				break;
				case 'control':
					type = 'control';
					if ('parameters' in parsed) {
						if (('param' in parsed['parameters']) && ('type' in parsed['parameters'])) {
							logme('received: ' + data);
							var thisparam = parsed['parameters']['param'];
							var thistype = parsed['parameters']['type'];
							if (thisparam in params) {
								//var step = (params[thisparam]['max'] - params[thisparam]['min']) / 20;
								switch(thistype) {
									case 'add':
										params[thisparam]['value'] += params[thisparam]['step'];
										if (params[thisparam]['value'] > params[thisparam]['max']) params[thisparam]['value'] = params[thisparam]['max'];
									break;
									case 'minus':
										params[thisparam]['value'] -= params[thisparam]['step'];
										if (params[thisparam]['value'] < params[thisparam]['min']) params[thisparam]['value'] = params[thisparam]['min'];
									break;
									default:
										var value = parseFloat(thistype);
										if ((value > params[thisparam]['min']) && (value < params[thisparam]['max'])) params[thisparam]['value'] = value;
										//console.log('weird type received, assuming it\'s a direct value: '+thistype);
									break;
								}
								
								// update param on canvas via websockets
								sendWebSocketUpdateToCanvas(thisparam);
							}
						}
					}
					if ('ping' in parsed) {
						// send back a pong in similar way to POST pong
						var thisid = getID(client.id);
						if (thisid in active_conn) {
							
							// only send the params assigned to this connection
							var prr = {};
							for (c in connections) {
								//console.log('pong connection: ' + connections[c]['ip'] + ' ' + active_conn[thisid]['socket'].ra);
								if (connections[c]['ip'] == active_conn[thisid]['socket'].ra) {
									if ('params' in connections[c]) {
										//console.log(connections[c]['params']);
										prr[connections[c]['params']] = params[connections[c]['params']];
									}
								}
							}
							
							active_conn[thisid]['socket'].send(JSON.stringify({'pong': 'pong', 'parameters': prr}));
						}
					}
				break;
				default:
					logme('unknown assisted perfomer');
				break;
			}
		}
		
		// keep latest message in memory
		var thisid = getID(client.id);
		if (thisid in active_conn) {
			active_conn[thisid]['latest_message'] = lmsg;
			active_conn[thisid]['latest_timestamp'] = getTimestamp();
			active_conn[thisid]['client_type'] = type;
		}
		
		// if IP is not listed on connections, send message to refresh page automatically
		var found = false;
		for (c in connections) {
			if (connections[c]['ip'] == active_conn[thisid]['socket'].ra) {
				found = true;
			}
		}
		
		if (!found) {
			active_conn[thisid]['socket'].send(JSON.stringify({'refresh': 'mebeautiful'}));
			// will only be properly interpreted by controller pages to reload themselves automatically
		}

    });

    client.on('close', function () {
        logme("websocket closed, removing it");
        var thisid = getID(client.id);
        if (thisid != -1) {
			console.log('removing...' + client.ra);
			//if (client.ra) removeTakenParamFromClosingIP(client.ra);
			active_conn.splice(thisid, 1);
		}
    });

    client.on('error', function () {
        logme("websocket error, removing it");
        var thisid = getID(client.id);
        if (thisid != -1) {
			console.log('removing...' + client.ra);			
			//if (client.ra) removeTakenParamFromClosingIP(client.ra);
			active_conn.splice(thisid, 1);
		}
    });
});

function sendWebSocketUpdateToCanvas(thisparam) {
	if (thisparam in params) {
		for (var i = 0; i < active_conn.length; i++) {
			if (active_conn[i]['socket'] && (active_conn[i]['client_type'] == 'canvas')) {
				var obj = {};
				obj[thisparam] = params[thisparam]['value'];
				active_conn[i]['socket'].send(JSON.stringify(obj));
			}
		}
	}
}

function getID(thisid) {
    for (var i = 0; i < active_conn.length; i++) {
        if (active_conn[i]['uid'] == thisid) {
            return i;
        }
    }
    return -1;
}

var tsps_timeout = 2000;
var tsps_ids = [];

function checkTSPS(tsps) {

	// reference: http://www.tsps.cc/docs/tsps-json-protocol
	
	// check if this object is indeed a TSPS object and update our array
	if (tsps) {
		if ('type' in tsps) {
			if ((tsps['type'] == 'personUpdated') || (tsps['type'] == 'personEntered')) {
				tsps['timestamp'] = getTimestamp();
				//console.log(tsps);
				
				var found = false;
				for (var i = 0; i < tsps_ids.length; i++) {
					//console.log(tsps_ids[i]['id'] + ' ' + tsps['id']);
					if (tsps_ids[i]['id'] == tsps['id']) {
						tsps_ids[i] = clone(tsps);
						found = true;
						//console.log('found id '+ tsps['id']);
					}
				}
				if (!found) tsps_ids[tsps_ids.length] = clone(tsps);
				
				//console.log( tsps['centroid']['x'] + ' ' + tsps['centroid']['y'] < 0.25);
			}
		}
	}
	//console.log('count: ' + tsps_ids.length);
	
	// remove tracking of ids after update timeout
	for (var i = 0; i < tsps_ids.length; i++) {
		//console.log(tsps_ids);
		if ((getTimestamp() - tsps_ids[i]['timestamp']) > tsps_timeout) {
			tsps_ids.splice(i, 1);
			i--;
		}
	}
	
	// TODO: updated values of assigned parameters to oldest active id
	
}



//
// simulate gamestate changes with arrow keys
//

stdin = process.stdin;
stdin.on('data', function (data) {
    if (data == '\u0003') { process.exit(); }
	if (data == '\u001B\u005B\u0043') {
		process.stdout.write('right');
	}
    if (data == '\u001B\u005B\u0044') {
		process.stdout.write('left');
	}
	if (data == '0') { 
		gamedata = 0;
		for (var i=0; i < active_conn.length; i++) active_conn[i]['socket'].send(JSON.stringify({'rms': Math.random()}));
	} // reset game state
	
	//if (data == 'o') openMidi('RottenApple (1)');
	//if (data == 's') sendMidi();
	//if (data == 'c') closeMidi();
	
    process.stdout.write('Captured Key : ' + data + "\n");
});
stdin.setEncoding('utf8');
stdin.setRawMode(true);
stdin.resume();

function clone(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}



module.exports = app;
