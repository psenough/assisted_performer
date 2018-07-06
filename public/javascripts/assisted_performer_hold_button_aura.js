
var zonebase = 120;
var client_state = 0;
var game_state = 0;

var display_post_lag = false;

navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;

var CONNECTION_MODE_WS_ONLY = 0;
var CONNECTION_MODE_POST_ONLY = 1;
var CONNECTION_MODE_ANY = 2; // try ws if ws exists, if not, try post

var connection_mode = CONNECTION_MODE_ANY;

var inp_half_height = 0;
var inp_start_y = 0;
var inp_start_x = 0;
var inp_dragging = false;
var usedheight = 0;
var usedwidth = 0;
	
function calculate_buttons_position( rebuild ) {
	var ratio = window.innerWidth / window.innerHeight; // 1080 x 1920
	var gfxratio = 640/1136;//375/627;//1080/1920;

	if (ratio > gfxratio) {
		//console.log('height touching the sides');
		usedheight = window.innerHeight;
		usedwidth = parseInt(usedheight * gfxratio, 10);
	} else {
		//console.log('width touching the sides');
		usedwidth = window.innerWidth;
		usedheight = parseInt(usedwidth / gfxratio, 10);
	}
	
	//console.log(usedheight + ' ' + usedwidth);
		
	var background = document.getElementById('background');
	if (background || !rebuild) {
		background.setAttribute('class','background');
		background.style.left = parseInt(window.innerWidth*0.5 - usedwidth*0.5,10) + 'px';
		background.style.width = parseInt(usedwidth,10) + 'px';
		background.style.height = parseInt(usedheight,10) + 'px';		
	} else {
		background = document.createElement('div');
		background.setAttribute('id','background');
		background.setAttribute('class','background');
		document.body.appendChild(background);
	}

	/*function inp_places() {
		console.log('placing');
		if (inp_dragging) return;
		inp_start_x = parseInt(window.innerWidth*0.5 - usedwidth*0.15,10);
		inp.style.left = inp_start_x + 'px';
		inp_start_y = parseInt(usedheight*0.4,10);
		inp.style.top = inp_start_y + 'px';
		inp_half_height = parseInt(usedwidth*0.15,10);
		inp.style.width = inp_half_height*2 + 'px';
		inp.style.height = inp_half_height*2 + 'px';
	}

	function update_value(px, py) {
		// check bounds
		var pad_bot = usedheight - usedheight*.26;
		var pad_top = usedheight*.23;
		if (py > pad_bot) py = pad_bot;
		if (py < pad_top) py = pad_top;
		//console.log('pad bounds: ' + usedwidth + ' ' + usedheight + ' ' + pad_top + ' ' + pad_bot);

		// drag the div to the correct place
		inp.style.top = (py - inp_half_height) + 'px';
		
		//{"pong":"pong","params":{"rms":{"min":0,"max":1,"step":0.05,"default":0.5,"value":0.5}}}
		// silly way to access key string of the only param
		for (key in server_params) {
			var pad_diff = (pad_bot - pad_top);
			var val_diff = (server_params[key]['max'] - server_params[key]['min']);
			//console.log(pad_bot + ' ' + pad_top + ' ' + (pad_bot - pad_top) + ' ' + (server_params[key]['max'] - server_params[key]['min']));
			var value = server_params[key]['max'] - (((py - pad_top)/pad_diff) * val_diff);
			
			// clamp to stepped value
			var diff = null;
			var value2 = null;
			for (var i = server_params[key]['min']; i < server_params[key]['max'] + server_params[key]['step']; i += server_params[key]['step'] ) {
				var newDiff = Math.abs(value - i);
				if (diff == null || newDiff < diff) {
					value2 = i;
					diff = newDiff;
				}
			}
			var value3 = parseFloat(value2).toFixed(2);
			//console.log(value + ' ' + value2 + ' ' + value3);
			
			// updated output box
			var outp = document.getElementById('outp');
			if (outp) outp.innerHTML = server_params[key].friendly_name + ' ' + value3;
			
			// update nodejs
			if ( server_params[key]['value'] != value3) {
				sendvote(key, value3)
			}
			
			// save value
			server_params[key]['value'] = value3;

			break;
		}
	}*/
	
	var inp = document.getElementById('inp');
	if (inp || !rebuild) {
		// do nothing	
	} else {
		inp = document.createElement('div');
		inp.setAttribute('id','inp');
		inp.setAttribute('class','asset');
		inp_start_x = parseInt(window.innerWidth*0.5 - usedwidth*0.25,10);
		inp.style.left = inp_start_x + 'px';
		inp_start_y = parseInt(window.innerHeight*0.5-usedwidth*0.25,10);
		inp.style.top = inp_start_y + 'px';
		inp.style.width = usedwidth*0.5 + 'px';
		inp.style.height = usedwidth*0.5 + 'px';
		document.body.appendChild(inp);
		
		inp.addEventListener("mousedown", function(e) {
			start_sending();
		});
		inp.addEventListener("mouseup", function(e) {
			stop_sending();
		});
		inp.addEventListener('touchstart', function(e){
			e.preventDefault();
			start_sending();
		});
		inp.addEventListener('touchend', function(e){
			e.preventDefault();
			stop_sending();
		});
	}

	var outp = document.getElementById('outp');
	if (outp || !rebuild) {
		// do nothing
	} else {
		outp = document.createElement('output');
		outp.setAttribute('id','outp');
		document.body.appendChild(outp);
	}

	if (display_post_lag) {
		var lag = document.getElementById('lag');
		if (lag || !rebuild) {
			// do nothing
		} else {
			lag = document.createElement('div');
			lag.setAttribute('id','lag');
			lag.setAttribute('class','lag');
			document.body.appendChild(lag);
		}
	}
}


function send_value() {
	console.log('sending...');
	// silly way to access key string of the only param
	for (key in server_params) {
		if (server_params[key]['value'] > server_params[key]['default_value']) {
			server_params[key]['value'] -= server_params[key]['step'];
			if (server_params[key]['value'] < server_params[key]) server_params[key]['value'] = server_params[key]['default_value'];
		}
		if (server_params[key]['value'] < server_params[key]['default_value']) {
			server_params[key]['value'] += server_params[key]['step'];
			if (server_params[key]['value'] > server_params[key]['default_value']) server_params[key]['value'] = server_params[key]['default_value'];
		}
		sendvote(key, server_params[key]['value']);
	}
}
	
var sending = undefined;

function start_sending() {
	if (sending == undefined) sending = setInterval(function() { send_value(); }, 200);
}

function stop_sending() {
	clearInterval(sending);
	sending = undefined;
}

window.onload = function(){
	connect_websockets();
	request_ping();
	setInterval(recheck_ping, max_timeout);
	calculate_buttons_position( true );
};

window.onresize = function(){
	calculate_buttons_position( true );
}

function sendvote(param, type) {
	//console.log('voting');
	switch(connection_mode) {
		case CONNECTION_MODE_WS_ONLY:
			sendvote_websockets(param, type);
		break;
		case CONNECTION_MODE_POST_ONLY:
			sendvote_post(param, type);
		break;
		case CONNECTION_MODE_ANY:
		default:
			if (!sendvote_websockets(param, type)) sendvote_post(param, type);
		break;
	}
}

function sendvote_websockets(param, type) {
	if (this_ws_open) {
		//console.log(param + ' ' + type);
		this_ws.send(JSON.stringify({'assisted_performer': 'control', 'parameters': {'param': param, 'type': type}}));
		return true;
	} else {
		return false;
	}
}

function sendvote_post(param,type) {
	var http = new XMLHttpRequest();
	var url = "/control";
	var params = "param=" + param + "&type=" + type;
	http.open("POST", url, true);
	http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	http.onreadystatechange = function() {
		if(http.readyState == 4 && http.status == 200) {
			console.log(http.responseText);
			//var headers = http.getAllResponseHeaders();
			//console.log(headers);
		}
	}
	http.send(params);
}

/*
function sendvote(votetype, pvote) {
	var zone = votetype; //zonebase + (team * nzones) + votetype;
	var http = new XMLHttpRequest();
	var url = "/vote";
	var params = "vote=fire";
	if (pvote !== undefined) params += "&pvote="+pvote;
	params +=  "&zone="+zone;
	console.log(params);
	http.open("POST", url, true);
	http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	http.onreadystatechange = function() {
		if(http.readyState == 4 && http.status == 200) {
			console.log(http.responseText);
			//var headers = http.getAllResponseHeaders();
			//console.log(headers);
		}
	}
	http.send(params);
}
*/
var max_timeout = 1000;
var d = new Date();
var n = d.getTime();

//TODO: this recheck_ping works but should probably be checked with pingout instead of n, have to debug it properly

function recheck_ping() {
	var d2 = new Date();
	var n2 = d2.getTime();
	if ((n2-n) > max_timeout) {
		request_ping();
	}
}

var gamedata = null;
var pingout;
var pingin;
var lastpingtime = 0;

function request_ping() {
	switch(connection_mode) {
		case CONNECTION_MODE_WS_ONLY:
			request_ping_websockets();
		break;
		case CONNECTION_MODE_POST_ONLY:
			request_ping_post();
		break;
		case CONNECTION_MODE_ANY:
		default:
			if (!request_ping_websockets()) request_ping_post();
		break;
	}
}

function request_ping_websockets() {
	if (this_ws_open) {
		this_ws.send(JSON.stringify({'assisted_performer': 'control', 'ping': lastpingtime}));
		var d2 = new Date();
		pingout = d2.getTime();
		return true;
	} else {
		return false;
	}
}

function request_ping_post() {
	var http = new XMLHttpRequest();
	var url = "/ping";
	var params = 'lastpingtime='+lastpingtime;
	http.open("POST", url, true);
	http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	http.onreadystatechange = function() {
		if(http.readyState == 4 && http.status == 200) {
			if (http.responseText) {
				
				//console.log(http.responseText);
				
				pingin = (new Date()).getTime();
				lastpingtime = (pingin-pingout);
				if (display_post_lag) {
					var lag = document.getElementById('lag');
					if (lag) lag.innerHTML = (pingin-pingout) + 'ms';
				}

				var headers = parseResponseHeaders(http.getAllResponseHeaders());
				if ('Assisted-Performer' in headers) {
					//console.log(headers['Assisted-Performer']);
					server_params = JSON.parse(headers['Assisted-Performer']);
					calculate_buttons_position( false );
				}
			}
		}
	}
	http.send(params);
	
	var d2 = new Date();
	pingout = d2.getTime();
}

var server_params = {};

function parseResponseHeaders(headerStr) {
  var headers = {};
  if (!headerStr) {
    return headers;
  }
  var headerPairs = headerStr.split('\u000d\u000a');
  for (var i = 0, len = headerPairs.length; i < len; i++) {
    var headerPair = headerPairs[i];
    var index = headerPair.indexOf('\u003a\u0020');
    if (index > 0) {
      var key = headerPair.substring(0, index);
      var val = headerPair.substring(index + 2);
      headers[key] = val;
    }
  }
  return headers;
}

/*document.addEventListener("keydown", keyDownTextField, false);

function keyDownTextField(e) {
var keyCode = e.keyCode;
console.log(keyCode);
	switch(keyCode) {
		case 49: //1
			team = 0;
			calculate_buttons_position();
		break;
		case 50: //2
			team = 1;
			calculate_buttons_position();
		break;
		case 51: //3
			team = 2;
			calculate_buttons_position();
		break;
		case 52: //4
			team = 3;
			calculate_buttons_position();
		break;
		case 53: //5
			team = 4;
			calculate_buttons_position();
		break;
		case 54: //6
			team = 5;
			calculate_buttons_position();
		break;
		
		case 48: //0
			client_state = 5;
			calculate_buttons_position();
		break;
	}
}
*/


var this_websockets = 'ws://'+location.host.split(':')[0]+':3001';
var this_ws = null;
var this_ws_open = false;
var this_timeout = false;

function connect_websockets() {

	console.log("attempt to connect");
	this_timeout = false;

	this_ws = new WebSocket(this_websockets);    

	this_ws.onopen = function() {
		this_ws_open = true;
		console.log("opened socket");
		this_ws.send(JSON.stringify({'assisted_performer': 'control'}));
	};

	this_ws.onmessage = function(evt) {
		
		console.log(evt.data);
		
		try {
			var parsed = JSON.parse(evt.data);
		} catch(exc) {
			console.log('could not parse data');
		}
		
		if (parsed) {

			// check if we are getting a pong back, if we are, calculate ping time and display it
			if (('pong' in parsed) && ('parameters' in parsed)) {
				var pingin = (new Date()).getTime();
				lastpingtime = (pingin-pingout);
				if (display_post_lag) {
					var lag = document.getElementById('lag');
					if (lag) lag.innerHTML = (pingin-pingout) + 'ms';
				}
				
				server_params = parsed['parameters'];
			
				var outp = document.getElementById('outp');
				if (outp) {
					for (key in server_params) {
						//console.log(server_params[key]);
						outp.innerHTML = server_params[key]['friendly_name'] + ' ' + parseFloat(server_params[key]['value']).toFixed(2);
					
						/*if (!inp_dragging) {
							var inp = document.getElementById('inp');
							if (inp) {
								var pad_bot = usedheight - usedheight*.26;
								var pad_top = usedheight*.23;
								var pad_diff = (pad_bot - pad_top);
								var val_diff = (server_params[key]['max'] - server_params[key]['min']);
								var posy = pad_top - ((server_params[key]['value'] - server_params[key]['max']) / val_diff) * pad_diff;
								inp.style.top = parseInt(posy - inp_half_height,10) + 'px';
							}
						}*/
					}
				}
				
			}
			
			if ('refresh' in parsed) {
				if (parsed['refresh'] == 'mebeautiful') setTimeout(function(){location = location;},2000);
			}
		
		} else {
			console.log('error parsing');
		}
	
	};

	this_ws.onclose = function() {
		console.log("closed socket");
		this_ws = null;
		this_ws_open = false;
		if (!this_timeout) this_timeout = setTimeout(function(){connect_websockets()},5000);
	};

	this_ws.onerror = function() {
		console.log("error on socket");
		this_ws = null;
		this_ws_open = false;
		if (!this_timeout) this_timeout = setTimeout(function(){connect_websockets()},5000);
	};
};

document.ontouchmove = function(event){
	event.preventDefault();
}
