
var display_post_lag = false;

rand = function(n){
	return Math.floor(Math.random()*n);
};

window.onload = function(){init();};

var params = [];

function init() {
	try {
		connectWebSockets();
	} catch(e) {
		console.log(e);
	}
	setInterval(recheck_ping, max_timeout);
}

function resize() {
/*	
	var canvas = document.getElementById("canvas");
	//console.log(canvas);
	if (!canvas) {
		canvas = document.createElement('canvas');
		canvas.setAttribute('id','canvas');
		document.body.appendChild(canvas);
	}

	canvas.setAttribute("width", w);
	canvas.setAttribute("height", h);
	
	ctx = canvas.getContext("2d");
	ctx.width = w;
	ctx.height = h;
	halfw = w*.5;
	halfh = h*.5;
	
	var ip = document.getElementById("ip"); 
	if (!ip) {
		ip = document.createElement('div');
		ip.setAttribute('id','ip');
		document.body.appendChild(ip);
		ip.innerHTML = 'http://192.168.1.28:8090';
	}*/
}

var using = false;

var this_websockets = 'ws://'+location.host.split(':')[0]+':3001';
var this_ws = null;
var this_ws_open = false;
var this_timeout = false;

function connectWebSockets() {

	console.log("attempt to connect");
	this_timeout = false;

	this_ws = new WebSocket(this_websockets);        

	this_ws.onopen = function() {
		console.log("opened socket");
		this_ws.send(JSON.stringify({'assisted_performer': 'master'}));
		this_ws_open = true;
	};

	this_ws.onmessage = function(evt) {

		//console.log(evt.data);

		var parsed = JSON.parse(evt.data);
		if ('pong' in parsed) {
			var pingin = (new Date()).getTime();
			lastpingtime = (pingin-pingout);
			if (display_post_lag) {
				var lag = document.getElementById('lag');
				if (lag) lag.innerHTML = (pingin-pingout) + 'ms';
			}
			console.log('recieved pong');
		}
		if (!using && ('parameters' in parsed)) {
			
			// delete row element of a no longer existing parameters
			for (p in params) {
				// check if it's still on the list
				var check = false;
				for (p2 in parsed['parameters']) {
					if (p == p2) check = true;
				}
				// not on the list, remove it
				if (check == false) {
					var dom = document.getElementById(p+'_row');
					if (dom) {
						dom.parentNode.removeChild(dom);
					}
				}
			}
			
			params = parsed['parameters'];
			
			//console.log(params);
			
			// lets try to avoid unelegant cleanups
			//document.body.innerHTML = '';
			
			var table = document.getElementById('table');
			if (!table) {
				table = document.createElement('table');
				table.setAttribute('class','table');
				table.setAttribute('id','table');
				document.body.appendChild(table);
			}
			
			for (key in params) {
				var row = document.getElementById(key+'_row');
				if (row) {
					// update values
					var input = document.getElementById(key);
					if (input) {
						input.setAttribute('min', params[key]['min']);
						input.setAttribute('max', params[key]['max']);
						input.setAttribute('step', params[key]['step']);
						input.setAttribute('value', params[key]['value']);
					}
					var output = document.getElementById(key+'_output');
					if (output) {
						output.innerHTML = params[key]['value'];
					}
				} else {
					// create divs
					row = document.createElement('row');
					row.setAttribute('class','row');
					row.setAttribute('id',key+'_row');
					table.appendChild(row);
			
					var col1 = document.createElement('cell');
					col1.setAttribute('class','cell');
					row.appendChild(col1);
					
					var label = document.createElement('label');
					label.setAttribute('id',key+'_label');
					label.setAttribute('for',key);
					label.innerHTML = params[key]['friendly_name'];
					col1.appendChild(label);
					
					var col2 = document.createElement('cell');
					col2.setAttribute('class','cell');
					row.appendChild(col2);
					
					var input = document.createElement('input');
					input.key = key;
					input.setAttribute('id',key);
					input.setAttribute('type','range');
					input.setAttribute('min', params[key]['min']);
					input.setAttribute('max', params[key]['max']);
					input.setAttribute('step', params[key]['step']);
					input.setAttribute('value', params[key]['value']);
					col2.appendChild(input);
					input.addEventListener('input', function(ev) {
						//console.log('stuff changed on '+this.value + ' ' +this.key);
						var dom = document.getElementById(this.key+'_output');
						if (dom) { 
							params[this.key]['value'] = this.value;
							dom.innerHTML = this.value;
						}
						using = true;
					}, false);
					input.addEventListener('change', function(evt) {
						using = false;
					}, false);

					var col3 = document.createElement('cell');
					col3.setAttribute('class','cell');
					row.appendChild(col3);
					
					var output = document.createElement('output');
					output.setAttribute('id',key+'_output');
					output.setAttribute('for',key);
					output.innerHTML = params[key]['value'];
					col3.appendChild(output);
				}
			}
			
			//TODO: add individual wander checkbox
			//TODO: add wander all button
			//TODO: add refresh button (get new params)
		}
	};

	this_ws.onclose = function() {
		console.log("closed socket");
		this_ws = null;
		this_ws_open = false;
		if (!this_timeout) this_timeout = setTimeout(function(){connectWebSockets()},5000);
	};

	this_ws.onerror = function() {
		console.log("error on socket");
		this_ws = null;
		this_ws_open = false;
		if (!this_timeout) this_timeout = setTimeout(function(){connectWebSockets()},5000);
	};
};

var max_timeout = 200;
var d = new Date();
var pingout = d.getTime();
var pingin;
var lastpingtime = 0;

function recheck_ping() {
	var d2 = new Date();
	var n2 = d2.getTime();
	if ((n2-pingout) > max_timeout) {
		//console.log('sending master ping' + (n2-pingout) + ' ' + max_timeout);
		request_ping_websockets();
	}
}

function request_ping_websockets() {
	//console.log('this: ' + this_ws_open);
	if (this_ws_open) {
		//console.log('sent: ' + params);
		this_ws.send(JSON.stringify({'assisted_performer': 'master', 'ping': lastpingtime, 'params': params}));
		var d2 = new Date();
		pingout = d2.getTime();
		return true;
	} else {
		return false;
	}
}


document.addEventListener("keydown", keydown, false);

function keydown(e) {
var keyCode = e.keyCode;
console.log(keyCode);
	switch(keyCode) {
		
		case 72: // h
			//TODO: hide text with ip adress
			/*var ip = document.getElementById("ip"); 
			if (ip) {
				if ((ip.className) == '') ip.className = 'hidden';
				 else ip.className = '';
			}*/
		break;
	}
}
