
var zonebase = 120;
var client_state = 0;
var game_state = 0;

var display_post_lag = false;

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
	
	var ke = (Object.keys(parsed['parameters']))[0];
	var key = parsed['parameters'][ke];
	
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
		//title.setAttribute('class', 'btn add_off');
		document.body.appendChild(title);
		title.innerHTML = parsed['parameters']['friendly_name'];
	}*/
	
	function opt_a_align() {
		opt_a.style.left = parseInt(window.innerWidth*0.5 - usedwidth*0.325,10) + 'px';
		opt_a.style.top = parseInt(usedheight*0.15,10) + 'px';
		opt_a.style.width = parseInt(usedwidth*0.65,10) + 'px';
		opt_a.style.height = parseInt(usedwidth*0.15,10) + 'px';
		opt_a.style.lineHeight = opt_a.style.height;
	}
	
	var opt_a = document.getElementById('opt_a');
	if (opt_a) {
		opt_a_align();
	} else {
		//console.log('adding opt a');
		if (key['possible'][0] != undefined) {
			opt_a = document.createElement('div');
			opt_a.setAttribute('id', 'opt_a');
			if (key['value'] == key['possible'][0]) opt_a.setAttribute('class', 'btn btn_on');
				else opt_a.setAttribute('class', 'btn btn_off');
			opt_a.innerHTML = '<span>' + key['possible'][0] + '</span>';
			opt_a.addEventListener("mousedown", function() {
				//sendvote(vote['uid'], vote['options'][0]);
				sendparam(ke, key['possible'][0]);
				opt_a.setAttribute('class', 'btn btn_on');
				opt_b.setAttribute('class', 'btn btn_off');
				if (opt_c) opt_c.setAttribute('class', 'btn btn_off');
				if (opt_d) opt_d.setAttribute('class', 'btn btn_off');
				if (navigator.vibrate) navigator.vibrate(100);
			});
			opt_a.addEventListener('touchstart', function(e){
				e.preventDefault();				
				opt_a.setAttribute('class', 'btn btn_on');
				opt_b.setAttribute('class', 'btn btn_off');
				if (opt_c) opt_c.setAttribute('class', 'btn btn_off');
				if (opt_d) opt_d.setAttribute('class', 'btn btn_off');
				sendparam(ke, key['possible'][0]);
				//sendvote(vote['uid'], vote['options'][0]);
				if (navigator.vibrate) navigator.vibrate(100);
			});
			opt_a.addEventListener('touchmove', function(e){
				e.preventDefault();
				opt_a.setAttribute('class', 'btn btn_on');
				opt_b.setAttribute('class', 'btn btn_off');
				if (opt_c) opt_c.setAttribute('class', 'btn btn_off');
				if (opt_d) opt_d.setAttribute('class', 'btn btn_off');
			});
			/*opt_a.addEventListener('touchend', function(e){
				e.preventDefault();
				opt_a.setAttribute('class', 'btn btn_off');
			});*/
			document.body.appendChild(opt_a);
			opt_a_align();
		}
	}
	
	function opt_b_align() {
		opt_b.style.left = parseInt(window.innerWidth*0.5 - usedwidth*0.325,10) + 'px';
		opt_b.style.top = parseInt(usedheight*0.35,10) + 'px';
		opt_b.style.width = parseInt(usedwidth*0.65,10) + 'px';
		opt_b.style.height = parseInt(usedwidth*0.15,10) + 'px';
		opt_b.style.lineHeight = opt_b.style.height;
	}
	
	var opt_b = document.getElementById('opt_b');
	if (opt_b) {
		opt_b_align();
	} else {
		//console.log('adding opt b');
		if (key['possible'][1] != undefined) {
			opt_b = document.createElement('div');
			opt_b.setAttribute('id', 'opt_b');
			if (key['value'] == key['possible'][1]) opt_b.setAttribute('class', 'btn btn_on');
				else opt_b.setAttribute('class', 'btn btn_off');
			opt_b.innerHTML = '<span>' + key['possible'][1] + '</span>';
			opt_b.addEventListener("mousedown", function() {
				sendparam(ke, key['possible'][1]);
				//sendvote(vote['uid'], vote['options'][1]);
				opt_a.setAttribute('class', 'btn btn_off');
				opt_b.setAttribute('class', 'btn btn_on');
				if (opt_c) opt_c.setAttribute('class', 'btn btn_off');
				if (opt_d) opt_d.setAttribute('class', 'btn btn_off');
				if (navigator.vibrate) navigator.vibrate(100);
			});
			opt_b.addEventListener('touchstart', function(e){
				e.preventDefault();				
				opt_a.setAttribute('class', 'btn btn_off');
				opt_b.setAttribute('class', 'btn btn_on');
				if (opt_c) opt_c.setAttribute('class', 'btn btn_off');
				if (opt_d) opt_d.setAttribute('class', 'btn btn_off');
				sendparam(ke, key['possible'][1]);
				//sendvote(vote['uid'], vote['options'][1]);
				if (navigator.vibrate) navigator.vibrate(100);
			});
			opt_b.addEventListener('touchmove', function(e){
				e.preventDefault();
				opt_a.setAttribute('class', 'btn btn_off');
				opt_b.setAttribute('class', 'btn btn_on');
				if (opt_c) opt_c.setAttribute('class', 'btn btn_off');
				if (opt_d) opt_d.setAttribute('class', 'btn btn_off');
			});
			/*opt_b.addEventListener('touchend', function(e){
				e.preventDefault();
				opt_b.setAttribute('class', 'btn btn_off');
			});*/
			document.body.appendChild(opt_b);
			opt_b_align();
		}
	}
	
	function opt_c_align() {
		opt_c.style.left = parseInt(window.innerWidth*0.5 - usedwidth*0.325,10) + 'px';
		opt_c.style.top = parseInt(usedheight*0.55,10) + 'px';
		opt_c.style.width = parseInt(usedwidth*0.65,10) + 'px';
		opt_c.style.height = parseInt(usedwidth*0.15,10) + 'px';
		opt_c.style.lineHeight = opt_c.style.height;
	}
	
	var opt_c = document.getElementById('opt_c');
	if (opt_c) {
		opt_c_align();
	} else {
		//console.log('adding opt c');
		if (key['possible'][2] != undefined) {
			opt_c = document.createElement('div');
			opt_c.setAttribute('id', 'opt_c');
			if (key['value'] == key['possible'][2]) opt_c.setAttribute('class', 'btn btn_on');
				else opt_c.setAttribute('class', 'btn btn_off');
			opt_c.innerHTML = '<span>' + key['possible'][2] + '</span>';
			opt_c.addEventListener("mousedown", function() {
				sendparam(ke, key['possible'][2]);
				//sendvote(vote['uid'], vote['options'][2]);
				opt_a.setAttribute('class', 'btn btn_off');
				opt_b.setAttribute('class', 'btn btn_off');
				if (opt_c) opt_c.setAttribute('class', 'btn btn_on');
				if (opt_d) opt_d.setAttribute('class', 'btn btn_off');
				if (navigator.vibrate) navigator.vibrate(100);
			});
			opt_c.addEventListener('touchstart', function(e){
				e.preventDefault();				
				opt_a.setAttribute('class', 'btn btn_off');
				opt_b.setAttribute('class', 'btn btn_off');
				if (opt_c) opt_c.setAttribute('class', 'btn btn_on');
				if (opt_d) opt_d.setAttribute('class', 'btn btn_off');
				sendparam(ke, key['possible'][2]);
				//sendvote(vote['uid'], vote['options'][2]);
				if (navigator.vibrate) navigator.vibrate(100);
			});
			opt_c.addEventListener('touchmove', function(e){
				e.preventDefault();
				opt_a.setAttribute('class', 'btn btn_off');
				opt_b.setAttribute('class', 'btn btn_off');
				if (opt_c) opt_c.setAttribute('class', 'btn btn_on');
				if (opt_d) opt_d.setAttribute('class', 'btn btn_off');
			});
			/*opt_c.addEventListener('touchend', function(e){
				e.preventDefault();
				opt_c.setAttribute('class', 'btn btn_off');
			});*/
			document.body.appendChild(opt_c);
			opt_c_align();
		}
	}
	
	function opt_d_align() {
		opt_d.style.left = parseInt(window.innerWidth*0.5 - usedwidth*0.325,10) + 'px';
		opt_d.style.top = parseInt(usedheight*0.75,10) + 'px';
		opt_d.style.width = parseInt(usedwidth*0.65,10) + 'px';
		opt_d.style.height = parseInt(usedwidth*0.15,10) + 'px';
		opt_d.style.lineHeight = opt_d.style.height;
	}
	
	var opt_d = document.getElementById('opt_d');
	if (opt_d) {
		opt_d_align();
	} else {
		//console.log('adding opt d');
		if (key['possible'][3] != undefined) {
			opt_d = document.createElement('div');
			opt_d.setAttribute('id', 'opt_d');
			if (key['value'] == key['possible'][3]) opt_d.setAttribute('class', 'btn btn_on');
				else opt_d.setAttribute('class', 'btn btn_off');
			opt_d.innerHTML = '<span>' + key['possible'][3] + '</span>';
			opt_d.addEventListener("mousedown", function() {
				sendparam(ke, key['possible'][3]);
				//sendvote(vote['uid'], vote['options'][3]);
				opt_a.setAttribute('class', 'btn btn_off');
				opt_b.setAttribute('class', 'btn btn_off');
				if (opt_c) opt_c.setAttribute('class', 'btn btn_off');
				if (opt_d) opt_d.setAttribute('class', 'btn btn_on');
				if (navigator.vibrate) navigator.vibrate(100);
			});
			opt_d.addEventListener('touchstart', function(e){
				e.preventDefault();				
				opt_a.setAttribute('class', 'btn btn_off');
				opt_b.setAttribute('class', 'btn btn_off');
				if (opt_c) opt_c.setAttribute('class', 'btn btn_off');
				if (opt_d) opt_d.setAttribute('class', 'btn btn_on');
				sendparam(ke, key['possible'][3]);
				//sendvote(vote['uid'], vote['options'][3]);
				if (navigator.vibrate) navigator.vibrate(100);
			});
			opt_d.addEventListener('touchmove', function(e){
				e.preventDefault();
				opt_a.setAttribute('class', 'btn btn_off');
				opt_b.setAttribute('class', 'btn btn_off');
				if (opt_c) opt_c.setAttribute('class', 'btn btn_off');
				if (opt_d) opt_d.setAttribute('class', 'btn btn_on');
			});
			/*opt_d.addEventListener('touchend', function(e){
				e.preventDefault();
				opt_d.setAttribute('class', 'btn btn_off');
			});*/
			document.body.appendChild(opt_d);
			opt_d_align();
		}
	}
	
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


function sendparam(param, value) {
	if (this_ws_open) {
		this_ws.send(JSON.stringify({'assisted_performer': 'control', 'parameters': {'param': param, 'value': value}}));
		return true;
	} else {
		return false;
	}
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
var parsed = [];

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
	calculate_buttons_position();
}

var this_websockets = 'ws://'+location.host.split(':')[0];
var this_ws = null;
var this_ws_open = false;
var this_timeout = false;
var prev_active = '';

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
			parsed = JSON.parse(evt.data);
		} catch(exc) {
			console.log('could not parse data');
		}
		
		if (parsed) {
			if (('pong' in parsed) && ('parameters' in parsed)) {
				var pingin = (new Date()).getTime();
				lastpingtime = (pingin-pingout);
				if (display_post_lag) {
					var lag = document.getElementById('lag');
					if (lag) lag.innerHTML = (pingin-pingout) + 'ms';
				}

				//get previous active uid
				/*let prev_active = '';
				for (let i=0; i<votes.length; i++) {
					if (votes[i]['active'] == true) prev_active = votes[i]['uid'];
				}*/
				
				// update global votes variable
				/*votes = parsed['votes'];
				
				//get previous active uid
				let new_active = '';
				for (let i=0; i<votes.length; i++) {
					if (votes[i]['active'] == true) new_active = votes[i]['uid'];
				}*/
				
				var ke = (Object.keys(parsed['parameters']))[0];
				var key = parsed['parameters'][ke];
				if (prev_active != ke) {
					console.log('changing to ' + ke);
					prev_active = ke;
					var opt_a = document.getElementById('opt_a');
					if (opt_a) document.body.removeChild(opt_a);
					var opt_b = document.getElementById('opt_b');
					if (opt_b) document.body.removeChild(opt_b);
					var opt_c = document.getElementById('opt_c');
					if (opt_c) document.body.removeChild(opt_c);
					var opt_d = document.getElementById('opt_d');
					if (opt_d) document.body.removeChild(opt_d);
				}
				
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