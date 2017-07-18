
var zonebase = 120;
var client_state = 0;
var game_state = 0;

var display_post_lag = true;

navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;

var CONNECTION_MODE_WS_ONLY = 0;
var CONNECTION_MODE_POST_ONLY = 1;
var CONNECTION_MODE_ANY = 2; // try ws if ws exists, if not, try post

var connection_mode = CONNECTION_MODE_ANY;

function calculate_buttons_position() {
	//console.log('calculating positions');
	var ratio = window.innerWidth / window.innerHeight; // 1080 x 1920
	var gfxratio = 375/627;//1080/1920;
	var usedHeight = 0;
	var usedWidth = 0;
	if (ratio > gfxratio) {
		//console.log('height touching the sides');
		var usedheight = window.innerHeight;
		var usedwidth = parseInt(usedheight * gfxratio, 10);
	} else {
		//console.log('width touching the sides');
		var usedwidth = window.innerWidth;
		var usedheight = parseInt(usedwidth / gfxratio, 10);
	}

	// background image
	var background = document.getElementById('background');
	if (background) {
		
		background.style.left = parseInt(window.innerWidth*0.5 - usedwidth*0.5,10) + 'px';
		//background.style.top = parseInt(0,10) + 'px';

		background.style.width = parseInt(usedwidth,10) + 'px';
		background.style.height = parseInt(usedheight,10) + 'px';		
	} else {
		background = document.createElement('div');
		background.setAttribute('id','background');
		background.setAttribute('class','background');
		document.body.appendChild(background);
	}
	
	console.log(votes);
	if (votes != undefined) {
		for (v in votes) {
			let vote = votes[v];
			console.log('vote:');
			console.log(vote);
			/*var title = document.getElementById('title');
			if (title) {
				title.style.left = parseInt(window.innerWidth*0.5 - usedwidth*0.25,10) + 'px';
				title.style.top = parseInt(usedheight*0.15,10) + 'px';
				title.style.width = parseInt(usedwidth*0.5,10) + 'px';
				title.style.height = parseInt(usedwidth*0.5,10) + 'px';
			} else {
				console.log('adding title');
				title = document.createElement('div');
				title.setAttribute('id', 'title');
				title.setAttribute('class', 'btn add_off');
				document.body.appendChild(title);
			}*/
			
			var opt_a = document.getElementById('opt_a');
			if (opt_a) {
				opt_a.style.left = parseInt(window.innerWidth*0.5 - usedwidth*0.25,10) + 'px';
				opt_a.style.top = parseInt(usedheight*0.15,10) + 'px';
				opt_a.style.width = parseInt(usedwidth*0.5,10) + 'px';
				opt_a.style.height = parseInt(usedwidth*0.5,10) + 'px';
			} else {
				console.log('adding opt a');
				opt_a = document.createElement('div');
				opt_a.setAttribute('id', 'opt_a');
				opt_a.setAttribute('class', 'btn opt_a_off');
				opt_a.innerHTML = vote['options'][0];
				opt_a.addEventListener("mousedown", function() {
					sendvote(vote['uid'], vote['options'][0]);
					if (navigator.vibrate) navigator.vibrate(100);
				});
				opt_a.addEventListener('touchstart', function(e){
					e.preventDefault();				
					opt_a.setAttribute('class', 'btn opt_a_on');
					sendvote(vote['uid'], vote['options'][0]);
					if (navigator.vibrate) navigator.vibrate(100);
				});
				opt_a.addEventListener('touchmove', function(e){
					e.preventDefault();
					opt_a.setAttribute('class', 'btn opt_a_on');
				});
				opt_a.addEventListener('touchend', function(e){
					e.preventDefault();
					opt_a.setAttribute('class', 'btn opt_a_off');
				});
				document.body.appendChild(opt_a);
			}
			
			var opt_b = document.getElementById('opt_b');
			if (opt_b) {
				opt_b.style.left = parseInt(window.innerWidth*0.5 - usedwidth*0.25,10) + 'px';
				opt_b.style.top = parseInt(usedheight*0.35,10) + 'px';
				opt_b.style.width = parseInt(usedwidth*0.5,10) + 'px';
				opt_b.style.height = parseInt(usedwidth*0.5,10) + 'px';
			} else {
				console.log('adding opt b');
				opt_b = document.createElement('div');
				opt_b.setAttribute('id', 'opt_b');
				opt_b.setAttribute('class', 'btn opt_b_off');
				opt_b.innerHTML = vote['options'][1];
				opt_b.addEventListener("mousedown", function() {
					sendvote(vote['uid'], vote['options'][1]);
					if (navigator.vibrate) navigator.vibrate(100);
				});
				opt_b.addEventListener('touchstart', function(e){
					e.preventDefault();				
					opt_b.setAttribute('class', 'btn opt_b_on');
					sendvote(vote['uid'], vote['options'][1]);
					if (navigator.vibrate) navigator.vibrate(100);
				});
				opt_b.addEventListener('touchmove', function(e){
					e.preventDefault();
					opt_b.setAttribute('class', 'btn opt_b_on');
				});
				opt_b.addEventListener('touchend', function(e){
					e.preventDefault();
					opt_b.setAttribute('class', 'btn opt_b_off');
				});
				document.body.appendChild(opt_b);
			}
			
			var opt_c = document.getElementById('opt_c');
			if (opt_c) {
				opt_c.style.left = parseInt(window.innerWidth*0.5 - usedwidth*0.25,10) + 'px';
				opt_c.style.top = parseInt(usedheight*0.55,10) + 'px';
				opt_c.style.width = parseInt(usedwidth*0.5,10) + 'px';
				opt_c.style.height = parseInt(usedwidth*0.5,10) + 'px';
			} else {
				console.log('adding opt c');
				opt_c = document.createElement('div');
				opt_c.setAttribute('id', 'opt_c');
				opt_c.setAttribute('class', 'btn opt_c_off');
				opt_c.innerHTML = vote['options'][2];
				opt_c.addEventListener("mousedown", function() {
					sendvote(vote['uid'], vote['options'][2]);
					if (navigator.vibrate) navigator.vibrate(100);
				});
				opt_c.addEventListener('touchstart', function(e){
					e.preventDefault();				
					opt_c.setAttribute('class', 'btn opt_c_on');
					sendvote(vote['uid'], vote['options'][2]);
					if (navigator.vibrate) navigator.vibrate(100);
				});
				opt_c.addEventListener('touchmove', function(e){
					e.preventDefault();
					opt_c.setAttribute('class', 'btn opt_c_on');
				});
				opt_c.addEventListener('touchend', function(e){
					e.preventDefault();
					opt_c.setAttribute('class', 'btn opt_c_off');
				});
				document.body.appendChild(opt_c);
			}
			
			var opt_d = document.getElementById('opt_d');
			if (opt_d) {
				opt_d.style.left = parseInt(window.innerWidth*0.5 - usedwidth*0.25,10) + 'px';
				opt_d.style.top = parseInt(usedheight*0.75,10) + 'px';
				opt_d.style.width = parseInt(usedwidth*0.5,10) + 'px';
				opt_d.style.height = parseInt(usedwidth*0.5,10) + 'px';
			} else {
				console.log('adding opt d');
				opt_d = document.createElement('div');
				opt_d.setAttribute('id', 'opt_d');
				opt_d.setAttribute('class', 'btn opt_d_off');
				opt_d.innerHTML = vote['options'][3];
				opt_d.addEventListener("mousedown", function() {
					sendvote(vote['uid'], vote['options'][3]);
					if (navigator.vibrate) navigator.vibrate(100);
				});
				opt_d.addEventListener('touchstart', function(e){
					e.preventDefault();				
					opt_d.setAttribute('class', 'btn opt_d_on');
					sendvote(vote['uid'], vote['options'][2]);
					if (navigator.vibrate) navigator.vibrate(100);
				});
				opt_d.addEventListener('touchmove', function(e){
					e.preventDefault();
					opt_d.setAttribute('class', 'btn opt_d_on');
				});
				opt_d.addEventListener('touchend', function(e){
					e.preventDefault();
					opt_d.setAttribute('class', 'btn opt_d_off');
				});
				document.body.appendChild(opt_d);
			}
		}
	}
	
	//var index = 0;
	//for (param in server_params) {
	/*	
		// increase
		var add = document.getElementById('p_' + param + '_add');
		if (add) {
			add.style.left = parseInt(window.innerWidth*0.5 - usedwidth*0.25,10) + 'px';
			add.style.top = parseInt(usedheight*0.15,10) + 'px';
			add.style.width = parseInt(usedwidth*0.5,10) + 'px';
			add.style.height = parseInt(usedwidth*0.5,10) + 'px';
		} else {
			console.log('adding');
			add = document.createElement('div');
			add.setAttribute('id', 'p_' + param + '_add');
			add.setAttribute('class', 'btn add_off');
			add.addEventListener("mousedown", function() {
				sendvote(param, 'add');
				if (navigator.vibrate) navigator.vibrate(100);
			});
			add.addEventListener('touchstart', function(e){
				e.preventDefault();				
				add.setAttribute('class', 'btn add_on');
				sendvote(param, 'add');
				if (navigator.vibrate) navigator.vibrate(100);
			});
			add.addEventListener('touchmove', function(e){
				e.preventDefault();
				add.setAttribute('class', 'btn add_on');
			});
			add.addEventListener('touchend', function(e){
				e.preventDefault();				
				add.setAttribute('class', 'btn add_off');
			});
			document.body.appendChild(add);
		}

		// value
		var value = document.getElementById('p_' + param + '_value');
		if (value) {
			value.style.left = parseInt(window.innerWidth*0.5 - usedwidth*0.25,10) + 'px';
			value.style.top = parseInt(usedheight*0.5,10) + 'px';
			value.style.width = parseInt(usedwidth*0.5,10) + 'px';
			value.style.height = parseInt(usedheight*0.15,10) + 'px';
			console.log(server_params[param]['value']);
			value.innerHTML = server_params[param]['value'];
		} else {
			console.log('valueing');
			value = document.createElement('div');
			value.setAttribute('id', 'p_' + param + '_value');
			value.setAttribute('class', 'value');
			document.body.appendChild(value);
		}
		
		// decrease
		var minus = document.getElementById('p_' + param + '_minus');
		if (minus) {
			minus.style.left = parseInt(window.innerWidth*0.5 - usedwidth*0.25,10) + 'px';
			minus.style.top = parseInt(usedheight*0.6,10) + 'px';
			minus.style.width = parseInt(usedwidth*0.5,10) + 'px';
			minus.style.height = parseInt(usedwidth*0.5,10) + 'px';
		} else {
			console.log('minusing');
			minus = document.createElement('div');
			minus.setAttribute('id', 'p_' + param + '_minus');
			minus.setAttribute('class', 'btn minus_off');
			minus.addEventListener("mousedown", function() {
				sendvote(param, 'minus');
				if (navigator.vibrate) navigator.vibrate(100);
			});
			minus.addEventListener('touchstart', function(e){
				e.preventDefault();				
				minus.setAttribute('class', 'btn minus_on');
				sendvote(param, 'minus');
				if (navigator.vibrate) navigator.vibrate(100);
			
			});
			minus.addEventListener('touchmove', function(e){
				e.preventDefault();
				minus.setAttribute('class', 'btn minus_on');
			});
			minus.addEventListener('touchend', function(e){
				e.preventDefault();				
				minus.setAttribute('class', 'btn minus_off');
			});
			document.body.appendChild(minus);
		}
		
		//TODO: add subtitle
		
		//index++;
	//}
	*/
	// rotation canvas
	/*
	var rotation_canvas = document.getElementById('rotation_canvas');
	if (rotation_canvas) {
		rotation_canvas.style.left = parseInt(window.innerWidth*0.5 - usedwidth*0.5,10) + 'px';
		rotation_canvas.style.top = parseInt(usedheight*0.58,10) + 'px';

		var w = parseInt(usedwidth*1.0,10);
		var h = parseInt(usedheight*0.2,10);
		rotation_canvas.style.width = w + 'px';
		rotation_canvas.style.height = h + 'px';
		rotation_canvas.setAttribute('width', rotation_canvas.style.width);
		rotation_canvas.setAttribute('height', rotation_canvas.style.height);
		
		//switch (client_state) {
		//	case 2:
				rotation_canvas.setAttribute('class','asset rotation_canvas');
				rotation_canvas_animation = true;
				ctx = rotation_canvas.getContext("2d");
				ctx.width = w;
				ctx.height = h;
				animate_rotation(ctx,w,h);
		//	break;
		//	default:
		//		rotation_canvas_animation = false;
		//		rotation_canvas.setAttribute('class','hidden');
		//	break;
		//}
	} else {
		rotation_canvas = document.createElement('canvas');
		rotation_canvas.setAttribute('id', 'rotation_canvas');
		document.body.appendChild(rotation_canvas);
		calculate_buttons_position();
	}*/
	/*
	var bw_fire_left = document.getElementById('bw_fire_left');
	if (bw_fire_left) {
		bw_fire_left.style.left = parseInt(window.innerWidth*0.5 - usedwidth*0.375,10) + 'px';
		bw_fire_left.style.top = parseInt(usedheight*0.7,10) + 'px';

		bw_fire_left.style.width = parseInt(usedwidth*0.25,10) + 'px';
		bw_fire_left.style.height = parseInt(usedheight*0.25,10) + 'px';
		
		switch (client_state) {
			case 4:
				if (team == 1) bw_fire_left.setAttribute('class','btn tap_off');
					else bw_fire_left.setAttribute('class','hidden');
			break;
			default:
				bw_fire_left.setAttribute('class','hidden');
			break;
		}
	}

	var shield = document.getElementById('shield');
	if (shield) {
		shield_start_x = parseInt(window.innerWidth*0.5 - usedwidth*0.35,10);
		shield.style.left = shield_start_x + 'px';
		shield_start = parseInt(usedheight*0.58,10);
		shield.style.top = shield_start + 'px';

		shield_half_height = parseInt(usedwidth*0.2,10);
		shield.style.width = shield_half_height*2 + 'px';
		shield.style.height = shield_half_height*2 + 'px';
		
		switch (client_state) {
			case 4:
				if (team == 5) shield.setAttribute('class','asset shield');
					else shield.setAttribute('class','hidden');
			break;
			default:
				shield.setAttribute('class','hidden');
			break;
		}
	}
	*/
	
	if (display_post_lag) {
		var lag = document.getElementById('lag');
		if (lag) {
			// do nothing
		} else {
			lag = document.createElement('div');
			lag.setAttribute('id','lag');
			lag.setAttribute('class','lag');
			document.body.appendChild(lag);
		}
	}
}

window.onload = function(){
	request_ping();
	setInterval(recheck_ping, max_timeout);
	calculate_buttons_position();
};

window.onresize = function(){
	calculate_buttons_position();
}

function sendvote(param, type) {
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
		this_ws.send(JSON.stringify({'assisted_performer': 'vote', 'votes': {'uid': param, 'vote': type}}));
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
					calculate_buttons_position();
				}
			}
		}
	}
	http.send(params);
	
	var d2 = new Date();
	pingout = d2.getTime();
}

var server_params = {};
var votes = [];

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

document.addEventListener("keydown", keyDownTextField, false);

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
			if (('pong' in parsed) && ('votes' in parsed)) {
				var pingin = (new Date()).getTime();
				lastpingtime = (pingin-pingout);
				if (display_post_lag) {
					var lag = document.getElementById('lag');
					if (lag) lag.innerHTML = (pingin-pingout) + 'ms';
				}

				votes = parsed['votes'];
				
				calculate_buttons_position();
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

connect_websockets();
