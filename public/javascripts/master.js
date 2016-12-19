
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



var this_websockets = 'ws://'+location.host.split(':')[0]+':3001';
var this_ws = null;
var this_timeout = false;

function connectWebSockets() {

	console.log("attempt to connect");
	this_timeout = false;

	this_ws = new WebSocket(this_websockets);        

	this_ws.onopen = function() {
		console.log("opened socket");
		this_ws.send(JSON.stringify({'assisted_performer': 'master'}));
	};

	this_ws.onmessage = function(evt) {

		console.log(evt.data);

		var parsed = JSON.parse(evt.data);
		
		if ('parameters' in parsed) {
			params = parsed['parameters'];
			
			console.log(params);
			
			document.body.innerHTML = '';
			
			var table = document.createElement('table');
			table.setAttribute('class','table');
			document.body.appendChild(table);
			
			for (key in params) {
				var row = document.createElement('row');
				row.setAttribute('class','row');
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
				input.setAttribute('value', params[key]['value']);
				col2.appendChild(input);
				input.addEventListener('input', function(ev) {
					//console.log('stuff changed on '+this.value + ' ' +this.key);
					var dom = document.getElementById(this.key+'_output');
					if (dom) { dom.innerHTML = this.value; }
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
			
			//TODO: send the values back to the server
			//TODO: add individual wander checkbox
			//TODO: add wander all button
			//TODO: add refresh button (get new params)
		}
	};

	this_ws.onclose = function() {
		console.log("closed socket");
		this_ws = null;
		if (!this_timeout) this_timeout = setTimeout(function(){connectWebSockets()},5000);
	};

	this_ws.onerror = function() {
		console.log("error on socket");
		this_ws = null;
		if (!this_timeout) this_timeout = setTimeout(function(){connectWebSockets()},5000);
	};
};

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

//		this_ws.send(JSON.stringify({'assisted_performer': 'control', 'parameters': {'param': param, 'type': type}}));

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
