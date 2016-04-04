
rand = function(n){
	return Math.floor(Math.random()*n);
};

window.onload = function(){init();};

function init() {
	connectWebSockets();
	drawCanvas();
}

var w;
var h;
var ctx;
var halfw;
var halfh;

var params = {
	'rms': { 'min': 0.0, 'max': 1.0, 'default': 0.5, 'value': 0.5 }
};

function drawCanvas() {

	resize();
	loadLine('','');

	var num = 80;
	var tradius = w;
	var rms = 0.5;
	
	ctx.fillStyle = "rgba(122,12,78,1.0)";
	ctx.fillRect(0,0,w,h);
	
	function drawThis() {
		
		var d2 = new Date();
		var n2 = d2.getTime(); 
		
		var sin1 = Math.sin((n2-n)/200)+1.0;
		var cos1 = Math.cos((n2-n)/800)+1.0;
		var cos2 = Math.cos((n2-n)/2800);
		
		var rms = params['rms']['value'];
		
		var calc = [];
		for(var i=0; i<num; i++) {
			calc[i] = [];
			//calc[i]['this'] = parseInt(cos1*200)%tradius,10);
			calc[i]['this'] = parseInt((cos1*tradius + sin1*200*((num-i)*i + cos2*rms*5))%w,10);
		}
		
		var sizex = w/num;
		var sizexhalf = parseInt((w/num)*0.5,10);
		var sizey = parseInt(10*(w/h),10);
		
		ctx.lineWidth = Math.ceil(sizexhalf*0.5 + rms*sizexhalf,10);//10*rms;
		ctx.fillStyle = "rgba("+parseInt(155*cos1*0.5+50,10)+","+parseInt(25*sin1*rms*0.75,10)+",105,1.0)";
		ctx.strokeStyle = "rgba(0,0,0,1.0)";
		if (rms > 0.4) ctx.strokeStyle = ctx.fillStyle;

		ctx.save();
		
		//console.log(sizex);
		//ctx.translate(w*.5,h*.5);
		//ctx.rotate((n2-n)*0.01);
		for(var i=0; i<num; i++) {
			ctx.beginPath();
			var posx = parseInt(i*sizex,10);
			var posy = calc[i]['this'];
			ctx.moveTo(posx-sizexhalf, posy-sizey);
			ctx.lineTo(posx-sizexhalf, posy+sizey);
			ctx.lineTo(posx+sizexhalf, posy+sizey);
			ctx.lineTo(posx+sizexhalf, posy-sizey);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		}
		ctx.restore();
				
	}
	
	requestAnimationFrame( animate );
	
	var d = new Date();
	var n = d.getTime();
	var repeater = n;
	var rperiod = 6000;
	var index = 0;

	function animate() {
		requestAnimationFrame( animate );
		drawThis();
		
		/*var dom = document.getElementById('message');
		if (dom) {
			var d2 = new Date();
			var n2 = d2.getTime(); 
			if (((n2-n) > 6000) && (n2-repeater) > rperiod) {
				repeater = n2;
				loadLine('',words[index++]);
				if (index >= words.length) index = 0;
			}
		}*/
	}
}

window.onresize = resize;

function resize() {
	w = window.innerWidth;
	h = window.innerHeight;
	
	var canvas = document.getElementById("canvas");
	console.log(canvas);
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
}

function loadLine(thisclass, thistext) {
	//var content = '';
	//content += '<span class="'+thisclass+'">'+thistext+'</span><br />';
	//document.getElementById('message').innerHTML = content;
}

var words = [
"test12",
"test"
];

var this_websockets = 'ws://localhost:3001';
var this_ws = null;
var this_timeout = false;

function connectWebSockets() {

	console.log("attempt to connect");
	this_timeout = false;

	this_ws = new WebSocket(this_websockets);        

	this_ws.onopen = function() {
		console.log("opened socket");
		this_ws.send("game|readyforduty");
	};

	this_ws.onmessage = function(evt) {
		
		console.log(evt.data);
		
		var parsed = JSON.parse(evt.data);
		
		for (instance in parsed) {
			if (instance in params) {
				params[instance]['value'] = parsed[instance]
			}
		}
		
		console.log(parsed['uniqueID']);
		
		/*
		if (game) {
		
			switch(game.state) {
			
				case game.instructionsScreen: {
						game.interactWithInstructions(evt.data);
					}
					break;
				case game.gameScreen: {
						game.interactWithGame(evt.data);
					}
					break;
			}
		} else {
			console.log('no game, no message');
		}*/
	
	};

	this_ws.onclose = function() {
		console.log("closed socket");
		if (!this_timeout) this_timeout = setTimeout(function(){this_connectWebSockets()},5000);
	};

	this_ws.onerror = function() {
		console.log("error on socket");
		if (!this_timeout) this_timeout = setTimeout(function(){this_connectWebSockets()},5000);
	};
};
