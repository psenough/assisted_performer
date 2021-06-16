
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
var expressWs = require('express-ws')(app);
var util = require('util')



//
// init express
//

var port = 8080;
var httpServer = http.createServer(app);
httpServer.on('error', onError);
app.listen(port);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));



//
// init global vars used by express
//

var connections = []; // only lists controllers, not canvas
var connection_timeout = 2000;
var streaming_milliseconds = 50;
var logdir = '';



//
// express request handling
//

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

//app.use(catchall);

app.use(function (req, res, next) {
  //console.log('middleware');
  req.testing = 'testing';
  return next();
});
 
 
app.on('error', onError);



//
// global functions 
//

function getTimestamp() {
	return (new Date()).getTime();
}

function removeTakenParamFromClosingIP(thisip) {
	//console.log('ip: ' + thisip);
	var idx = 0;
	for (c in connections) {
		//console.log('connection: ' + connections[c]['ip'] + ' ' + thisip);
		if (connections[c]['ip'] == thisip) {
			delete connections[c]['params'];
			//delete connections[c];
			idx = connections.indexOf(c);
			break;
		}
	}
	//connections.splice(idx,1);
}

function getUntakenParam() {
	var param = undefined;
	var params_available = [];
	for (p in params) {
		var istaken = false;
		
		// skip tsps controllers
		if (p.substring(0,5) == 'tsps_') continue;
		
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

function isParamTaken(p) {
	var istaken = false;
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
	return istaken;
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

var active_conn = [];
var id = 0;
var params = {};

function addToParams(theseparams) {
	for (p in theseparams) {
		//TODO: check if param already exists and notify on console that it's getting replaced
		params[p] = theseparams[p];
	}
}

expressWs.getWss().on('connection', function(client, req) {
	console.log('connection open');
    client.id = id++;
	//console.log(client);
	client.upgradeReq = req;
	client.ra = client.upgradeReq.connection.remoteAddress;
    client.send(JSON.stringify({'uniqueID': '2'}));
    active_conn.push({'uid': client.id, 'socket': client, 'latest_message': {}, 'client_type': null, 'latest_timestamp': getTimestamp()});
    logme('new ws connection from: ' + client.ra);
	logme('total ws active conns: ' + active_conn.length);
});

app.ws('/', function(ws, req) {
  var client = ws;
  //console.log('received ws');

  ws.on('message', function(data) {
		var lmsg = data;
		var type = null;
		
		//logme('received data: ' + data);
		
		// crashes trying to parse, ignore
		var parsed;
		try {
			parsed = JSON.parse(data);
		} catch (e) {
			logme('received with bad json format: ' + data);
			console.error(e);
			return;
		}

		// fails to parse, ignore
		if (!parsed) {
			logme('received with bad json format2: ' + data);
			return;
		} else {
			
			if (!('assisted_performer' in parsed)) {
				logme('no assisted performer object found in parse: ' + data);
				return;
			}
			
			switch (parsed['assisted_performer']) {
				/*case 'canvas':
					type = 'canvas';
					if ('parameters' in parsed) {
						params = {};
						//addAudioParams();
						addToParams(parsed['parameters']);
						logme('received canvas: ' + data);
						// received message with new parameters, reassigning all existing controller connections
						reassignParameters();
					}
					if ('words' in parsed) {
						logme('speak: ' + parsed['words']);
						say.stop();
						say.speak(parsed['words'], params['voices_list']['value'], params['voices_speed']['value']);
					}
				break;
				case 'control':
					type = 'control';
					if ('parameters' in parsed) {
						if ('param' in parsed['parameters']) {
							logme('received control: ' + data);
							var thisparam = parsed['parameters']['param'];
							if (thisparam in params) {
								//console.log(thisparam);
								if ('value' in parsed['parameters']) {
									params[thisparam]['value'] = parsed['parameters']['value'];
									say.stop();
									say.speak(parsed['parameters']['value'], params['voices_list']['value'], params['voices_speed']['value']);
								}
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
							
							//active_conn[thisid]['socket'].send(JSON.stringify({'pong': 'pong', 'parameters': prr}));
							ws.send(JSON.stringify({'pong': 'pong', 'parameters': prr}));

						}
					}
				break;*/
				default:
					logme('unknown assisted perfomer');
				break;
			}
		}
		
		// keep latest message in memory
		var thisid = getID(client.id);
		if (thisid in active_conn) {
			//console.log(thisid + ' is updating');
			active_conn[thisid]['latest_message'] = lmsg;
			active_conn[thisid]['latest_timestamp'] = getTimestamp();
			active_conn[thisid]['client_type'] = type;
		}
		
		// if IP is not listed on connections, send message to refresh page automatically
		//console.log('checking ra: ' + active_conn[thisid]['socket'].ra);
		var found = false;
		for (c in connections) {
			try {
				if ((connections[c]['ip'] == active_conn[thisid]['socket'].ra) || (connections[c]['ip'] == '::ffff:'+active_conn[thisid]['socket'].ra) ){
					found = true;
					connections[c]['lasttime'] = getTimestamp();
				}
			} catch(exc) {
				logme(exc);
			}
		}
		
		if (!found) {
			//active_conn[thisid]['socket'].send(JSON.stringify({'refresh': 'mebeautiful'}));
			ws.send(JSON.stringify({'refresh': 'mebeautiful'}));

			// will only be properly interpreted by controller pages to reload themselves automatically
		}

  });
  
  ws.on('close', function(code) {
	console.log('closed connection');
	console.log('removing ' + this.id + ' ' + this.ra);
	var thisid = getID(this.id);
	var thisra = this.ra;
	if (thisid != -1) {
		console.log('removing...' + client.ra);
		active_conn.splice(thisid, 1);
	}
	removeTakenParamFromClosingIP(thisra);
	//setTimeout(checkAssignedParameters, check_parameters_delay);
  });
  
  ws.on('error', function(code) {
	onsole.log('error');
	console.log('removing ' + this.id + ' ' + this.ra);
	var thisid = getID(this.id);
	var thisra = this.ra;
	if (thisid != -1) {
		console.log('removing...' + client.ra);
		active_conn.splice(thisid, 1);
	}
	removeTakenParamFromClosingIP(thisra);
	//setTimeout(checkAssignedParameters, check_parameters_delay);
  });
});

var assign_parameters_delay = 500; // must be higher then the common ping travel time
var check_parameters_delay = 1000; // must be higher then the assign delay else will reassign to the same "still lingering" connection

function checkAssignedParameters() {
	// if there are connections waiting to get parameters, assign untaken parameters to one of them
	for (var i=0; i<connections.length; i++) {
		if ('params' in connections[i]){
			continue;
		} else {
			// check lastactivetime is lower then 3 seconds
			if ((getTimestamp() - connections[i]['lasttime']) < assign_parameters_delay) {
				console.log( connections[i]['ip'] + ' ' + (getTimestamp() - connections[i]['lasttime']));
				var p =  getUntakenParam();
				if (p != undefined) {
					connections[i]['params'] = [ p ];
					console.log('ip: ' + connections[i]['ip'] + ' now assigned to control param ' + connections[i]['params'] + ', total connections: ' + connections.length);
				}
			}
		}
	}
}

setInterval(function() {
	var worthchecking = false;
	var countparams = 0;
	//check for ping timeouts on connections
	for (var i=0; i<connections.length; i++) {
		if ((getTimestamp() - connections[i]['lasttime']) > connection_timeout) {
			//console.log(connections[i]['ip'] + ' ping timeout');
			removeTakenParamFromClosingIP(connections[i]['ip']);
			worthchecking = true;
		} else {
			countparams++; 
		}
	}
	//console.log(countparams + ' ' + Object.keys(params).length);
	if (countparams < Object.keys(params).length) worthchecking = true;
	if (worthchecking == true) checkAssignedParameters();
}, assign_parameters_delay);

function reassignParameters() {
	console.log('reassigning');
	//console.log(util.inspect(params));

	// clear assigned params from all connections
	for (var i=0; i<connections.length; i++) {
		if ('params' in connections[i]) connections[i]['params'] = undefined;
	}
	//console.log(util.inspect(connections));
	// reassign new ones to everyone connected
	for (i=0; i<connections.length; i++) {
		var p =  getUntakenParam();
		if (p != undefined) {
			connections[i]['params'] = [ p ];
			console.log('ip: ' + connections[i]['ip'] + ' now reassigned controlling param ' + connections[i]['params'] + ', total connections: ' + connections.length);
		}
	}
}

function sendWebSocketUpdateToCanvas(thisparam) {
	if (thisparam in params) {
		for (var i = 0; i < active_conn.length; i++) {
			if (active_conn[i]['socket'] && (active_conn[i]['client_type'] == 'canvas')) {
				var obj = {};
				obj[thisparam] = params[thisparam]['value'];
				try {
					active_conn[i]['socket'].send(JSON.stringify(obj));
				} catch(exc) {
					console.log(exc);
					active_conn.splice(i,1);
				}
			}
		}
	}
}

var streaming_milliseconds = 100;

var send_value_and_active = true;

setInterval(function() {
	let update = {};
	for (thisparam in params) {
		//console.log(thisparam);
		if (!send_value_and_active) {
			update[thisparam] = params[thisparam].value;
		} else {
			update[thisparam] = {
				"value": params[thisparam].value,
				"active": isParamTaken(thisparam)
			};
		}
	}
	for (var i = 0; i < active_conn.length; i++) {
		if (active_conn[i]['socket'] && (active_conn[i]['client_type'] == 'canvas')) {
			try {
				active_conn[i]['socket'].send(JSON.stringify(update));
			} catch(exc) {
				console.log(exc);
				//console.log('cleaning up');
				//console.log(active_conn[thisid]['socket'].ra);
				active_conn.splice(i,1);
			}
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

function getIDbyRA(thisra) {
    for (var i = 0; i < active_conn.length; i++) {
        if (active_conn[i]['socket'].ra == thisra) {
            return i;
        }
    }
    return -1;
}



//
// twitch bot
// TODO

const oauth = require('./oauth.js');
const tmi = require('tmi.js');
const tmi_client = new tmi.Client({
	options: { debug: true, messagesLogLevel: "info" },
	connection: {
		reconnect: true,
		secure: true
	},
	identity: {
		username: oauth.botname,
		password: oauth.oauth
	},
	channels: [ 'psenough' ]
});
tmi_client.connect().catch(console.error);
tmi_client.on('message', (channel, tags, message, self) => {
	if(self) return;
	if(message.toLowerCase() === '!hello') {
		tmi_client.say(channel, `@${tags.username}, heya!`);
	}
});



//
// simulate gamestate changes with arrow keys
//

stdin = process.stdin;
stdin.on('data', function (data) {
    if (data == '\u0003') { process.exit(); }
	if (data == 'a') {
		console.log('listing active_conn:');
		for (a in active_conn) {
			console.log(active_conn[a]['uid'] + ' ' + active_conn[a]['socket']['id'] + ' ' + active_conn[a]['client_type'] + ' ' + active_conn[a]['socket']['ra']);
			//console.log('connection: ' + connections[c]['ip'] + ' ' + connections[c]['ip']['canvas']);
			//if ('params' in connections[c]) {
			//console.log(util.inspect(active_conn[a]));
			//}
		}
	}
	/*if (data == 'p') {
		//var list = [];
		//for (p in params) list.push(p + ' :: ' + params[p]['friendly_name'] + ' :: ' + params[p]['value']);
		console.log('listing parameters:');
		console.log(util.inspect(params));
	}*/
    //process.stdout.write('Captured Key : ' + data + "\n");
});
stdin.setEncoding('utf8');
stdin.setRawMode(true);
stdin.resume();


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
