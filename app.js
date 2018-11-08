

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

var port = 80;
var httpServer = http.createServer(app);
httpServer.on('error', onError);
app.listen(port);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

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

// serve controller page
app.get('/', catchall);
app.get('/controller', catchall);
app.get('/slider', catchall);
function catchall(req, res, next) {
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	
	console.log('new controller page request');

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
			
			//found = true;
		}
	}
	
	// if we are dealing with a new IP, give it an unused param
	if (!found)
	{
		var param = getUntakenParam();
		
		// add the info to our connections records
		// params is an array because we might want to pass multiple parameters to a controller at some point
		if (param == undefined) {
			connections.push({ip: ip, lasttime: n});
			console.log('ip: ' + ip + ' on waiting list, total connections: ' + connections.length);
		} else {
			connections.push({ip: ip, params: [param], lasttime: n});
			console.log('ip: ' + ip + ' now controlling param ' + param + ', total connections: ' + connections.length);
		}
	}

	res.render('select', {title: 'Haiku'});
	res.end();
}

// serve canvas page
app.get('/canvas', canvas);
function canvas(req, res, next) {
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
		  //res.status(err.status).end();
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

	res.send('rcvd');
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

expressWs.getWss().on('connection', function(client) {
	console.log('connection open');
    client.id = id++;
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
				case 'canvas':
					params = {};
					//addAudioParams();
					addToParams(parsed['parameters']);
					type = 'canvas';
					logme('received canvas: ' + data);
					// received message with new parameters, reassigning all existing controller connections
					reassignParameters();
				break;
				case 'control':
					type = 'control';
					if ('parameters' in parsed) {
						if ('param' in parsed['parameters']) {
							logme('received control: ' + data);
							var thisparam = parsed['parameters']['param'];
							if (thisparam in params) {
								console.log(thisparam);
								if ('value' in parsed['parameters']) {
									params[thisparam]['value'] = parsed['parameters']['value'];
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
				break;
				default:
					logme('unknown assisted perfomer');
				break;
			}
		}
		
		// keep latest message in memory
		var thisid = getID(client.id);
		if (thisid in active_conn) {
			//console.log('its updating');
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
// serial port
//

var SerialPort = require('serialport');
var Readline = require('@serialport/parser-readline')
var serialPort = new SerialPort('COM3', { baudRate: 9600 });
const parser = serialPort.pipe(new Readline());
var previous_parser_input = '';
function parserfunction(someinput) {
	if (someinput != previous_parser_input) {
		//console.log('banana changed:'  + someinput);
		if (parseInt(someinput,10) == 1) {
			console.log('change of guardians!!!');
			for (var i = 0; i < active_conn.length; i++) {
				if (active_conn[i]['socket'] && (active_conn[i]['client_type'] == 'canvas')) {
					try {
						active_conn[i]['socket'].send(JSON.stringify({'changeseason':true}));
					} catch(exc) {
						console.log('failed to send conn to canvas');
					}
				}
			}
		}
		previous_parser_input = someinput;
	}
}
parser.on('data', parserfunction);



//
// simulate gamestate changes with arrow keys
//

stdin = process.stdin;
stdin.on('data', function (data) {
    if (data == '\u0003') { process.exit(); }
	if (data == 'a') {
		console.log('listing active_conn:');
		for (a in active_conn) {
			console.log(active_conn[a]['uid'] + ' ' + active_conn[a]['socket']['id'] + ' ' + active_conn[a]['socket']['ra']);
			//console.log('connection: ' + connections[c]['ip'] + ' ' + connections[c]['ip']['canvas']);
			//if ('params' in connections[c]) {
			//console.log(util.inspect(active_conn[a]));
			//}
		}
	}
	if (data == 'c') {
		console.log('listing connections:');
		for (c in connections) {
			//console.log('connection: ' + connections[c]['ip'] + ' ' + connections[c]['ip']['canvas']);
			//if ('params' in connections[c]) {
				console.log(util.inspect(connections[c]));
			//}
		}
	}
	if (data == 'p') {
		//var list = [];
		//for (p in params) list.push(p + ' :: ' + params[p]['friendly_name'] + ' :: ' + params[p]['value']);
		console.log('listing parameters:');
		console.log(util.inspect(params));
	}
	if (data == 'r') {
		reassignParameters();
	}
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
