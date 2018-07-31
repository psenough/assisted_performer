
var timeout = 2 * 60 * 1000; // default 2 minutes gameplay timeout
var start_timer = (new Date()).getTime();

var zonebase = 120;
var client_state = 0;
var game_state = 0;

var display_post_lag = false;

navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;

var CONNECTION_MODE_WS_ONLY = 0;
var CONNECTION_MODE_POST_ONLY = 1;
var CONNECTION_MODE_ANY = 2; // try ws if ws exists, if not, try post

var connection_mode = CONNECTION_MODE_WS_ONLY;

var inp_half_height = 0;
var inp_start_y = 0;
var inp_start_x = 0;
var inp_dragging = false;
var usedheight = 0;
var usedwidth = 0;
	
function calculate_buttons_position( rebuild ) {
	var ratio = window.innerWidth / window.innerHeight; // 1080 x 1920
	var gfxratio = 1242/2208;//375/627;//1080/1920;

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
	function place_bg() {
		console.log('placing bg');
		background.style.left = parseInt(window.innerWidth*0.5 - usedwidth*0.5,10) + 'px';
		background.style.width = parseInt(usedwidth,10) + 'px';
		background.style.height = parseInt(usedheight,10) + 'px';	
	}
	
	var background = document.getElementById('background');
	if (background || !rebuild) {
		place_bg();
	} else {
		background = document.createElement('div');
		background.setAttribute('id','background');
		background.setAttribute('class','background');
		document.body.appendChild(background);
		place_bg();
	}

	function update_value(px, py) {
		// check bounds
		var pad_top = usedheight*.23;
		var pad_bot = usedheight*.698;
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
	}
	
	function place_inp() {
		console.log('placing inp');
		if (inp_dragging) return;
		inp_start_x = parseInt(window.innerWidth*0.5 - usedwidth*0.43,10);
		inp.style.left = inp_start_x + 'px';
		inp_start_y = parseInt(usedheight*0.4,10);
		inp.style.top = inp_start_y + 'px';
		inp_half_height = parseInt(usedwidth*0.167,10);
		inp.style.width = inp_half_height*2 + 'px';
		inp.style.height = inp_half_height*2 + 'px';
	}
	
	var inp = document.getElementById('inp');
	if (inp || !rebuild) {
		place_inp();
	} else {
		inp = document.createElement('div');
		inp.setAttribute('id','inp');
		inp.setAttribute('class','asset');
		document.body.appendChild(inp);
		place_inp();
		
		inp.addEventListener("mousedown", function(e) {
			inp_dragging = true;
			// get position
			var px = e.clientX;
			var py = e.clientY;
			update_value(px,py);
		});
		inp.addEventListener("mousemove", function(e) {
			if (inp_dragging) {
				// get position
				var px = e.clientX;
				var py = e.clientY;
				update_value(px,py);
			}
		});
		inp.addEventListener("mouseup", function(e) {
			// get position
			var px = e.clientX;
			var py = e.clientY;
			update_value(px,py);
			inp_dragging = false;
		});
		inp.addEventListener('touchstart', function(e){
			e.preventDefault();
			inp_dragging = true;
		});
		inp.addEventListener('touchmove', function(e){
			e.preventDefault();
			inp_dragging = true;

			// get movement positions
			var px = e.changedTouches[0].pageX;
			var py = e.changedTouches[0].pageY;

			update_value(px,py);
		});
		inp.addEventListener('touchend', function(e){
			e.preventDefault();
			inp_dragging = false;
		});
	}

	function place_place() {
		console.log('placing place button');
		var width_of_button = parseInt(usedwidth*0.686,10);
		place.style.left = parseInt(window.innerWidth*0.5 + usedwidth*0.6465 - width_of_button,10) + 'px';
		place.style.top = parseInt(usedheight*0.1363,10) + 'px';
		place.style.width = width_of_button + 'px';
		place.style.height = parseInt((width_of_button * 597) / 712, 10) + 'px';
	}
	
	var place = document.getElementById('place');
	if (place || !rebuild) {
		place_place();
	} else {
		place = document.createElement('div');
		place.setAttribute('id','place');
		place.setAttribute('class','btn btn_place_off');
		document.body.appendChild(place);
		place_place();
		place.addEventListener("mousedown", function(e) {
			place.setAttribute('class','btn btn_place_on');
			for (key in server_params) {
				this_ws.send(JSON.stringify({'assisted_performer': 'place_obj', 'param': key, 'value': server_params[key]['value'] }));
			}
		});
		place.addEventListener("mouseup", function(e) {
			place.setAttribute('class','btn btn_place_off');			
		});
		place.addEventListener('touchstart', function(e){
			e.preventDefault();
			place.setAttribute('class','btn btn_place_on');	
			for (key in server_params) {
				this_ws.send(JSON.stringify({'assisted_performer': 'place_obj', 'param': key, 'value': server_params[key]['value'] }));
			}
		});
		place.addEventListener('touchend', function(e){
			e.preventDefault();
			place.setAttribute('class','btn btn_place_off');
		});
	}

	function place_skip() {
		console.log('placing place button');
		var width_of_button = parseInt(usedwidth*0.686,10);
		skip.style.left = parseInt(window.innerWidth*0.5 + usedwidth*0.6465 - width_of_button,10) + 'px';
		skip.style.top = parseInt(usedheight*0.475,10) + 'px';
		skip.style.width = width_of_button + 'px';
		skip.style.height = parseInt((width_of_button * 597) / 712, 10) + 'px';
	}
	
	var skip = document.getElementById('skip');
	if (skip || !rebuild) {
		place_skip();
	} else {
		skip = document.createElement('div');
		skip.setAttribute('id','skip');
		skip.setAttribute('class','btn btn_skip_off');
		document.body.appendChild(skip);
		place_skip();
		skip.addEventListener("mousedown", function(e) {
			skip.setAttribute('class','btn btn_skip_on');
			for (key in server_params) {
				this_ws.send(JSON.stringify({'assisted_performer': 'skip_obj', 'param': key, 'value': server_params[key]['value'] }));
			}
		});
		skip.addEventListener("mouseup", function(e) {
			skip.setAttribute('class','btn btn_skip_off');
		});
		skip.addEventListener('touchstart', function(e){
			e.preventDefault();
			skip.setAttribute('class','btn btn_skip_on');
			for (key in server_params) {
				this_ws.send(JSON.stringify({'assisted_performer': 'skip_obj', 'param': key, 'value': server_params[key]['value'] }));
			}
		});
		skip.addEventListener('touchend', function(e){
			e.preventDefault();
			skip.setAttribute('class','btn btn_skip_off');
		});
	}
	
	function place_color() {
		console.log('placing color');
		var width_of_button = parseInt(usedwidth*0.895,10);
		color.style.left = parseInt(window.innerWidth*0.5 - usedwidth*0.4525,10) + 'px';
		color.style.top = parseInt(usedheight*0.856,10) + 'px';
		color.style.width = width_of_button + 'px';
		color.style.height = parseInt(usedheight*0.026,10) + 'px';
		for (key in server_params) { // there is only one
			console.log(server_params[key]['friendly_name']);
			var c_hex = server_params[key]['friendly_name'].substr(2);
			console.log(c_hex);
			color.style.backgroundColor = "'#"+c_hex+"'";
		}
	}
	
	var color = document.getElementById('color');
	if (color || !rebuild) {
		place_color();
	} else {
		color = document.createElement('div');
		color.setAttribute('id','color');
		color.setAttribute('class','asset'); //TODO: add color id
		document.body.appendChild(color);
		place_color();
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
	
	function place_no_param_overlay() {
		console.log('placing no param overlay');
		no_param_overlay.style.left = parseInt(window.innerWidth*0.5 - usedwidth*0.5,10) + 'px';
		no_param_overlay.style.width = parseInt(usedwidth,10) + 'px';
		no_param_overlay.style.height = parseInt(usedheight,10) + 'px';	
	}
	
	var no_param_overlay = document.getElementById('no_param_overlay');
	if (no_param_overlay || !rebuild) {
		place_no_param_overlay();
	} else {
		no_param_overlay = document.createElement('div');
		no_param_overlay.setAttribute('id','no_param_overlay');
		no_param_overlay.setAttribute('class','full');
		document.body.appendChild(no_param_overlay);
		place_no_param_overlay();
	}

	function place_timer() {
		console.log('placing timer');
		var width_of_button = parseInt(usedwidth*0.265,10);
		timer.style.left = parseInt(window.innerWidth*0.5 + usedwidth*0.3 - width_of_button,10) + 'px';
		timer.style.top = parseInt(usedheight*0.03,10) + 'px';
		timer.style.width = width_of_button + 'px';
		timer.style.height = parseInt(usedheight*0.067,10) + 'px';
		timer.style.fontSize = parseInt(usedheight*0.1,10) + 'px';
	}
	
	var timer = document.getElementById('timer');
	if (timer || !rebuild) {
		place_timer();
	} else {
		timer = document.createElement('div');
		timer.setAttribute('id','timer');
		//timer.setAttribute('class','timer');
		document.body.appendChild(timer);
		place_timer();
	}
	
}

var checkping;

window.onload = function(){
	connect_websockets();
	request_ping();
	checkping = setInterval(recheck_ping, max_timeout);
	calculate_buttons_position( true );
	window.requestAnimationFrame(timer_step);
};

function msToTime(duration) {
    var milliseconds = parseInt((duration%1000)/100)
        , seconds = parseInt((duration/1000)%60)
        , minutes = parseInt((duration/(1000*60))%60)
        , hours = parseInt((duration/(1000*60*60))%24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return minutes + ":" + seconds;
}

function timer_step() {
	var curr_timer = (new Date()).getTime();
	var millis = (curr_timer - start_timer);
	if (millis > timeout) {
		clearInterval(checkping);
		var no_param_overlay = document.getElementById('no_param_overlay');
		if (no_param_overlay) {
			no_param_overlay.setAttribute('class','timedout');
		}
		ticking = false;
	} else {
		var timer = document.getElementById('timer');
		if (timer) {
			timer.innerHTML = msToTime(timeout - millis);
		}
		window.requestAnimationFrame(timer_step);
	}
}
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

var max_timeout = 500;
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

var this_websockets = 'ws://'+location.host.split(':')[0]+':80';
var this_ws = null;
var this_ws_open = false;
var this_timeout = false;
var ticking = false;

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
				
				if (isEmpty(server_params)) {
					// display no param overlay
					var no_param_overlay = document.getElementById('no_param_overlay');
					if (no_param_overlay) no_param_overlay.setAttribute('class','full');
				} else {
					// update color box
					for (key in server_params) { // it's an iterator but we are only expecting one param to be passed
						var c_hex = server_params[key]['friendly_name'].substr(2);
						//console.log(c_hex);
						color.style.backgroundColor = '#'+c_hex;
						
						if (ticking == false) 
						{
							ticking = true;
							start_timer = (new Date()).getTime();
						}
					}
					
					// hide no param overlay
					var no_param_overlay = document.getElementById('no_param_overlay');
					if (no_param_overlay) no_param_overlay.setAttribute('class','hidden');
				}
			}
			
			if ('refresh' in parsed) {
				if (parsed['refresh'] == 'mebeautiful') setTimeout(function(){
					location = location;
				},2000);
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

function isEmpty(obj) {
	return Object.keys(obj).length === 0 && obj.constructor === Object;
}
