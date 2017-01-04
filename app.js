
//TODO: easy way to change system to give same parameter to multiple sources and apply the average
//TODO: handle multiple canvases connected

//
// init midi
//

var midi = require('midi');

// these are only the default config and default values, updated values are stored on the params object
var audio_config = {
	'midi_port': 1, // change this id to the listed midi port that you want to use
	'params': {
		'audio_0': { 'controller': 0, 'friendly_name': 'Bass Temperature', 'min': 0.0, 'max': 60.0, 'step': 1.0, 'default_value': 3.0, 'value': 3.0 },
		'audio_1': { 'controller': 1, 'friendly_name': 'Bass Reverb Time', 'min': 1.0, 'max': 127.0, 'step': 1.0, 'default_value': 20.0, 'value': 20.0 },
		'audio_2': { 'controller': 2, 'friendly_name': 'Frequency Garble', 'min': 20.0, 'max': 127.0, 'step': 1.0, 'default_value': 20.0, 'value': 20.0 },
		'audio_3': { 'controller': 3, 'friendly_name': 'Glitch Volume', 'min': 0.0, 'max': 60.0, 'step': 1.0, 'default_value': 0.0, 'value': 0.0 },
		'audio_4': { 'controller': 4, 'friendly_name': 'Audio Feedback', 'min': 0.0, 'max': 90.0, 'step': 1.0, 'default_value': 0.0, 'value': 0.0 }
	}
}

var output = new midi.output();
var midi_port_count = output.getPortCount();

for (var i=0; i<midi_port_count; i++) {
	console.log(i + ' :: ' + output.getPortName(i));
}

if ('midi_port' in audio_config) {
	if (audio_config['midi_port'] <= midi_port_count) {
		output.openPort(audio_config['midi_port']);
	}
}

function addAudioParams() {
	// add the audio parameters to the global list of controllable parameters
	if (audio_config) {
		if ('params' in audio_config) addToParams(audio_config['params']);
	}
}

var audio_update_rate = 20;

setInterval(function() {
	if (audio_config) {
		if ('params' in audio_config) {
			for (thisparam in params) {	
				for (audioparam in audio_config['params']) {
					if (thisparam == audioparam) {
						// 176 is the code for control change, all messages are sent on channel 0 it seems
						//console.log(audio_config['params'][thisparam]['controller']);
						output.sendMessage([176,audio_config['params'][thisparam]['controller'],parseInt(params[thisparam]['value'],10)]);
						continue;
					}
				}
			}
		}
	}
}, audio_update_rate);



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
var util = require('util')



//
// init express
//

var port = 8090;
var httpServer = http.createServer(app);
httpServer.on('error', onError);
httpServer.listen(port); // on windows 8, we need to call httpServer.listen(80,'172.17.0.20');

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
		connections.push({ip: ip, params: [param], lasttime: n, canvas: false});
		console.log('ip: ' + ip + ' now controlling param ' + param + ', total connections: ' + connections.length);
	}

	res.render('assisted_performer_slider_demobit', {title: 'Assisted Performer Slider'});
}

// serve canvas page
app.get('/canvas', canvas);
function canvas(req, res) {
	res.render('canvas', {title: 'Assisted Performer Canvas'});
	// not adding our canvas to the connections list
}

// serve master page
app.get('/master', master);
function master(req, res) {
	res.render('master', {title: 'Assisted Performer Master'});
	// not adding master to the connections list
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
      logme('Can not access port ' + port + ', either its already in use or requires elevated privileges');
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

app.use(catchall);

app.on('error', onError);



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
	var params_available = [];
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
		if (!istaken) params_available.push(p);
	}
	//console.log(params_available);
	if (params_available.length >= 1) param = params_available[parseInt(Math.random()*params_available.length,10)];
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



//
// websockets
//

var WebSocketServer = require('ws').Server
  , ws_server = new WebSocketServer({ port: 3001 });

var active_conn = [];
var id = 0;
var params = {};
addAudioParams();
//console.log(util.inspect(params));

function addToParams(theseparams) {
	for (p in theseparams) {
		//TODO: check if param already exists and notify on console that it's getting replaced
		params[p] = theseparams[p];
	}
}

ws_server.on('connection', function (client) {
    client.id = id++;
	//console.log(client.upgradeReq.connection.remoteAddress);
	//console.log(client.upgradeReq.headers.host.split(':')[0]);
	//client.ra = client.req.connection.remoteAddress;
	//client.ra = client.headers.origin;
	client.ra = client.upgradeReq.connection.remoteAddress;
	
	//console.log(client.ra);
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
					params = {};
					addAudioParams();
					addToParams(parsed['parameters']);
					type = 'canvas';
					logme('received: ' + data);
					// received message with new parameters, reassigning all existing controller connections
					reassignParameters();
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
										if ((value >= params[thisparam]['min']) && (value <= params[thisparam]['max'])) params[thisparam]['value'] = value;
										//console.log('weird type received, assuming it\'s a direct value: '+thistype + ' ' + value);
									break;
								}
								
								// update param on canvas via websockets, not needed here, is being streamed constantly
								//sendWebSocketUpdateToCanvas(thisparam);
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
								if ((connections[c]['ip'] == active_conn[thisid]['socket'].ra) || (connections[c]['ip'] == '::ffff:'+active_conn[thisid]['socket'].ra)) {
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
				case 'master':
					//console.log('received master');
					var thisid = getID(client.id);
					if (thisid in active_conn) {
						
						// if we were sent back master params, update our local values
						if ('params' in parsed) {
							for (p in parsed['params']) {
								if (p in params) {
									params[p]['value'] = parsed['params'][p]['value'];
								}
							}
						}
						
						// prepare output for sending
						var output = {'parameters': params};
						
						// if we got a ping, make sure we also reply with a pong, we're not savages!
						if ('ping' in parsed) output['pong'] = 'pong';
						
						// send the packet
						active_conn[thisid]['socket'].send(JSON.stringify(output));
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
		//console.log('checking ra: ' + active_conn[thisid]['socket'].ra);
		var found = false;
		for (c in connections) {
			if ((connections[c]['ip'] == active_conn[thisid]['socket'].ra) || (connections[c]['ip'] == '::ffff:'+active_conn[thisid]['socket'].ra) ){
				found = true;
				if (type == 'canvas') connections[c]['canvas'] = true;
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

function reassignParameters() {
	console.log('reassigning');
	//console.log(util.inspect(params));

	// clear assigned params from all connections
	for (var i=0; i<connections.length; i++) {
		if ('params' in connections[i]) connections[i]['params'] = undefined;
	}
	//console.log(util.inspect(connections));
	// reassign new ones to everyone connected
	for (var i=0; i<connections.length; i++) {
		if (connections[i]['canvas']) continue;
		connections[i]['params'] = getUntakenParam();
		console.log('ip: ' + connections[i]['ip'] + ' now controlling param ' + connections[i]['params'] + ', total connections: ' + connections.length);
	}
}

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

var streaming_milliseconds = 100;

setInterval(function() {
	var update = {};
	for (thisparam in params) {
		//console.log(thisparam);
		update[thisparam] = params[thisparam].value;
	}
	//console.log(update);
	for (var i = 0; i < active_conn.length; i++) {
		if (active_conn[i]['socket'] && (active_conn[i]['client_type'] == 'canvas')) {
			active_conn[i]['socket'].send(JSON.stringify(update));
		}
	}
}, streaming_milliseconds);

function getID(thisid) {
    for (var i = 0; i < active_conn.length; i++) {
        if (active_conn[i]['uid'] == thisid) {
            return i;
        }
    }
    return -1;
}



//
// computer vision (TSPS)
//

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
	}
	if (data == '1') {
		output.sendMessage([176,1,0]);
		console.log('sent midi test message');
	}
	if (data == 'p') {
		var list = [];
		for (p in params) list.push(p + ' :: ' + params[p]['friendly_name'] + ' :: ' + params[p]['value']);
		console.log(util.inspect(list));
	}
	if (data == 'r') {
		reassignParameters();
	}
	if (data == 'f') {
		floatback = !floatback;
		console.log('floatback: ' + floatback);
	}
    process.stdout.write('Captured Key : ' + data + "\n");
});
stdin.setEncoding('utf8');
stdin.setRawMode(true);
stdin.resume();



//
// float back values to default
//

var floatback = false;
var floatback_rate = 500; // miliseconds between each step update

setInterval(function() {
	if (floatback) {
		var update = {};
		for (thisparam in params) {
			// if higher, lower it, floor to default value if it goes over
			if (params[thisparam]['value'] > params[thisparam]['default_value']) {
				params[thisparam]['value'] -= params[thisparam]['step'];
				if (params[thisparam]['value'] < params[thisparam]['default_value']) params[thisparam]['value'] = params[thisparam]['default_value'];
				console.log('updating ' + params[thisparam]['friendly_name'] + ' to ' + params[thisparam]['value']);
			}
			// if lower, increase it, floor to default value if it goes over
			if (params[thisparam]['value'] < params[thisparam]['default_value']) {
				params[thisparam]['value'] += params[thisparam]['step'];
				if (params[thisparam]['value'] > params[thisparam]['default_value']) params[thisparam]['value'] = params[thisparam]['default_value'];
				console.log('updating ' + params[thisparam]['friendly_name'] + ' to ' + params[thisparam]['value']);
			}
		}
	}
}, floatback_rate);

//TODO: we could do floatbacks with lerps, would be smoother, and use another variable to define it's float rate?
//TODO: reminder that the step value was originally used for increase and decrease buttons with post messaging (before websockets enabled slider)



//
// generic functions
//

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
