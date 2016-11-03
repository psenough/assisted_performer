
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
	'rms': { 'friendly_name': 'RMS', 'min': 0.0, 'max': 1.0, 'step': 0.05, 'default_value': 0.5, 'value': 0.5 },
	'num': { 'friendly_name': 'Number', 'min': 2.0, 'max': 200.0, 'step': 2.0, 'default_value': 80.0, 'value': 80.0 },
	'red': { 'friendly_name': 'Red', 'min': 0.0, 'max': 255.0, 'step': 0.1, 'default_value': 122.0, 'value': 122.0 }
};

var EFFECT_DISCO_SQUARES = 0;
var EFFECT_SOMETHING_ELSE = 1;
var effect = EFFECT_SOMETHING_ELSE;

function drawCanvas() {

	resize();
	loadLine('','');

	var num = params['num']['value'];
	var tradius = w;
	var rms = params['rms']['value'];
	
	// default values
	ctx.fillStyle = "rgba(122,12,78,1.0)";
	ctx.fillRect(0,0,w,h);
	
	function disco_squares() {
		var d2 = new Date();
		var n2 = d2.getTime(); 
		
		var sin1 = Math.sin((n2-n)/200)+1.0;
		var cos1 = Math.cos((n2-n)/800)+1.0;
		var cos2 = Math.cos((n2-n)/2800);

		rms = params['rms']['value'];
		num = parseInt(params['num']['value'],10);
		var red = parseInt(params['red']['value'],10);
		
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
		var r1 = parseInt(red*cos1*0.5+50,10);
		if (r1 > 255) r1 = 255;
		if (r1 < 0) r1 = 0;
		ctx.fillStyle = "rgba("+r1+","+parseInt(25*sin1*rms*0.75,10)+",105,1.0)";
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
	
	function something_else() {
		ctx.clearRect(0,0,w,h);
		
		rms = params['rms']['value'];
		num = parseInt(params['num']['value'],10);
		var red = parseInt(params['red']['value'],10);
		
		var calc = [];
		for(var i=0; i<num; i++) {
			calc[i] = [];
			calc[i]['x'] = rand(w);
			calc[i]['y'] = rand(h);
			calc[i]['rot'] = rand(180);
		}
		
		var sizex = w/num;
		var sizexhalf = parseInt((w/num)*0.5,10);
		var sizey = parseInt(10*(w/h),10);
		
		ctx.strokeStyle = "rgba("+red+",10,10,0.5)";

		//ctx.save();
		ctx.beginPath();
		ctx.moveTo(calc[0]['x'], calc[0]['y']);
		for(var i=1; i<num; i++) {
			ctx.lineTo(calc[i]['x'], calc[i]['y']);
		}
		ctx.closePath();
		ctx.stroke();
	}
	
	function drawThis() {
		switch (effect) {
			case EFFECT_DISCO_SQUARES:
				disco_squares();
			break;
			case EFFECT_SOMETHING_ELSE:
				something_else();
			break;
		}				
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

var this_websockets = 'ws://'+location.host.split(':')[0]+':3001';
var this_ws = null;
var this_timeout = false;

function connectWebSockets() {

	console.log("attempt to connect");
	this_timeout = false;

	this_ws = new WebSocket(this_websockets);        

	this_ws.onopen = function() {
		console.log("opened socket");
		this_ws.send(JSON.stringify({'assisted_performer': 'canvas', 'parameters': params}));
	};

	this_ws.onmessage = function(evt) {

		//console.log(evt.data);

		var parsed = JSON.parse(evt.data);

		for (instance in parsed) {
			if (instance in params) {
				params[instance]['value'] = parsed[instance];
			}
		}

		console.log(parsed);
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


// TODO: get live input https://webaudiodemos.appspot.com/input/index.html

function initAudio() {
    /*var irRRequest = new XMLHttpRequest();
    irRRequest.open("GET", "sounds/cardiod-rear-levelled.wav", true);
    irRRequest.responseType = "arraybuffer";
    irRRequest.onload = function() {
        audioContext.decodeAudioData( irRRequest.response, 
            function(buffer) { reverbBuffer = buffer; } );
    }
    irRRequest.send();*/

    /*o3djs.require('o3djs.shader');

    analyser1 = audioContext.createAnalyser();
    analyser1.fftSize = 1024;
    analyser2 = audioContext.createAnalyser();
    analyser2.fftSize = 1024;

    analyserView1 = new AnalyserView("view1");
    analyserView1.initByteBuffer( analyser1 );
    analyserView2 = new AnalyserView("view2");
    analyserView2.initByteBuffer( analyser2 );*/

    /*if (!navigator.getUserMedia)
        navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    if (!navigator.getUserMedia)
        return(alert("Error: getUserMedia not supported!"));

    navigator.getUserMedia(constraints, gotStream, function(e) {
            alert('Error getting audio');
            console.log(e);
        });

    if ((typeof MediaStreamTrack === 'undefined')||(!MediaStreamTrack.getSources)){
        console.log("This browser does not support MediaStreamTrack, so doesn't support selecting sources.\n\nTry Chrome Canary.");
    } else {
        MediaStreamTrack.getSources(gotSources);
    }

    document.getElementById("effect").onchange=changeEffect;*/
	
	MediaStreamTrack.getSources(gotSources);
	
	if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
	  console.log("enumerateDevices() not supported.");
	  return;
	}

	// List cameras and microphones.

	navigator.mediaDevices.enumerateDevices()
	.then(function(devices) {
	  devices.forEach(function(device) {
		console.log(device.kind + ": " + device.label +
					" id = " + device.deviceId);
	  });
	})
	.catch(function(err) {
	  console.log(err.name + ": " + err.message);
	});
	
}

function gotSources(sourceInfos) {
	console.log(sourceInfos);
    /*var audioSelect = document.getElementById("audioinput");
    while (audioSelect.firstChild)
        audioSelect.removeChild(audioSelect.firstChild);

    for (var i = 0; i != sourceInfos.length; ++i) {
        var sourceInfo = sourceInfos[i];
        if (sourceInfo.kind === 'audio') {
            var option = document.createElement("option");
            option.value = sourceInfo.id;
            option.text = sourceInfo.label || 'input ' + (audioSelect.length + 1);
            audioSelect.appendChild(option);
        }
    }
    audioSelect.onchange = changeInput;*/
}
