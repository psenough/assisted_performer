
//
// dependencies
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
//var easymidi = require('easymidi');
//var outputmidi = null;


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



//
// init express
//

var httpServer = http.createServer(app);

httpServer.listen(80); // on windows 8, we need to call httpServer.listen(80,'172.17.0.20');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));



//
// init global vars
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

app.get('/', catchall);
function catchall(req, res) {
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	var team = 0; // default team 0

	// prepare to count teams
	//var teamcount = [];
	//for (var j=0; j<nteams; j++) teamcount[j] = 0;

	// get timestamp
	var d = new Date();
	var n = d.getTime();
	var thistime = d.toISOString().replace(/T/, ' ').replace(/\..+/, '');

	// check if ip is already in connections	
	var found = false;
	for (var i=0; i<connections.length; i++) {
		if (ip == connections[i]['ip']) {
			team = connections[i]['team'];
			connections[i]['lasttime'] = n;
			found = true;
		}

		// count team connections while we are at it
		//teamcount[connections[i]['team']] += 1;
	}

	// if we are dealing with a new ip, give it one of the less assigned teams
	// this value should be sent to the webpage somehow (on terminator it's being sent as part of the title)
	// the webpage itself, not the server, sets what zone value is being sent back as a vote
	if (!found) {
		//var teamstatus = 'teamstatus before add: ';
		// find team with lowest count
		//var lowestcountindex = 0;
		//for (var k=0; k<nteams; k++) {
		//	if (teamcount[k] < teamcount[lowestcountindex]) lowestcountindex = k;
		//	teamstatus += teamcount[k] + ' :::: ';
		//}
		team = 0;//lowestcountindex;
		//console.log(teamstatus);
		
		// add the info to our connections records
		connections.push({ip: ip, team: team, lasttime: n});
		console.log('ip: ' + ip + ' added to team ' + team + ', total connections: ' + connections.length);
	}

	res.render('assisted_performer', {title: 'Assisted Performer'});
}

app.get('/canvas', canvas);
function canvas(req, res) {
	res.render('canvas', {title: 'Assisted Performer Canvas'});
}

app.get('/favicon.ico', function(req, res){
	var options = {
		root: __dirname + '/public/',
		dotfiles: 'deny',
		headers: {
			'x-timestamp': Date.now(),
			'x-sent': true
		}
	};
	var fileName = 'images/avengers/favicon.ico';
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

app.post('/vote', function(req, res) {
	// get timestamp
	var d = new Date();
	var n = d.getTime();

	//console.log('this vote is in ' + req.body.vote + ' ' + votes.length);
	var thisvote = req.body.vote;
	var thispvote = req.body.pvote;
	//console.log('pvote: ' + thispvote);
	var thistime = d.toISOString().replace(/T/, ' ').replace(/\..+/, '');
	var thiszone = req.body.zone;
	var thisteam = 0;
	//console.log(req);
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	for (var i=0; i<connections.length; i++) {
		if (ip == connections[i]['ip']) {
			connections[i]['lasttime'] = n;
			//thisteam = connections[i]['team'];
			break;
		}
	}

	//console.log('before: '+votes.length);
	if ((thispvote !== undefined) && (thispvote == 'off')) {
		// remove prior reference to this permanent vote
		for (var i=0; i<votes.length; i++) {
			if ((ip == votes[i].ip) && (votes[i].pvote == 'on')) {
				//console.log('splicing your momma');
				votes.splice(i,1);
				break;
			}
		}
	} else {
		// business as usual, add new vote to
		votes.push({ vote: thisvote, pvote: thispvote, time: thistime, team: thisteam, zone: thiszone, ip: ip});
	}

	//saveVoteLog(ip+','+thistime+','+thisteam+','+thiszone+','+thisvote+','+thispvote);
	//winston.log('info', ip+',vote,'+thisteam+','+thiszone+','+thisvote+','+thispvote);
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
	res.send('rcvd|'+gamedata);
});

app.use(catchall);

app.set('port', process.env.port);
app.listen(app.get('port'));



//
// logging
//

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



app.on('error', onError);
app.on('listening', onListening);

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error('Port ' + port + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error('Port ' + port + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  debug('Listening on port ' + server.address().port);
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


// Start the Websocket server
//var WebSocketServer = require('ws').Server;
//var server = new WebSocketServer({port: 3001});
var ws = require('websocket.io');
var server = ws.listen(3001);

var active_conn = [];
var id = 0;

var TYPE_CANVAS = '0';
var TYPE_ASSISTED_PERFORMER = '1';
var TYPE_NODE = '2';

var list_of_requests = [];
// Callback function for when the websocket connects
server.on('connection', function (client) {
    client.id = id++;
    client.send(JSON.stringify({'uniqueID': '2'}));
    active_conn.push({'uid': client.id, 'socket': client, 'latest_message': {}});
    logme('active conns: ' + active_conn.length);

    // Callback for when we receive a message from this client
    client.on('message', function (data) {
        logme('received: ' + data);
		//logme('received something');

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
        }

        // keep latest message in memory
        active_conn[thisid]['latest_message'] = parsed;

        var timestamp = (new Date()).getTime();

    });

    // Callback for when when the websocket closes the connection
    client.on('close', function () {
        logme("websocket closed, removing it");
        var thisid = getID(client.id);
        if (thisid != -1) active_conn.splice(thisid, 1);
    });

    // Callback for when when the websocket raises an error
    client.on('error', function () {
        logme("websocket error, removing it");
        var thisid = getID(client.id);
        if (thisid != -1) active_conn.splice(thisid, 1);
    });
});

function getID(thisid) {
    for (var i = 0; i < active_conn.length; i++) {
        if (active_conn[i]['uid'] == thisid) {
            return i;
        }
    }
    return -1;
}

function logme(thistext) {
	console.log(thistext);
}

module.exports = app;
