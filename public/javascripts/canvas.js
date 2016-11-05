
rand = function(n){
	return Math.floor(Math.random()*n);
};

window.onload = function(){init();};

var cv;

function init() {
	connectWebSockets();
	cv = new drawCanvas();
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

let drawCanvas = function() {

	resize();
//	loadLine('','');

	// default values
	ctx.fillStyle = "rgba(0,0,0,1.0)";
	ctx.fillRect(0,0,w,h);
	
	
	var num = params['num']['value'];
	var rms = params['rms']['value'];
	var red = params['red']['value'];
	
	var seedrand = rand(360);
	
	var d2 = new Date();
	var n2 = d2.getTime(); 	
	var sin1 = Math.sin((n2-n)/200)+1.0;
	var sin3 = Math.sin((n2-n)/2800)+1.0;
	var cos1 = Math.cos((n2-n)/800)+1.0;
	var cos2 = Math.cos((n2-n)/2800);
	var cos3 = Math.cos((n2-n)/1600);
	var cos4 = Math.cos((n2-n)/5711);
	var sin2 = Math.sin(sin1*0.05+cos2)+1.0;
	
	var tradius = w;

	
	this.effects = {
		'UPDATE_TIMERS': {
			'on': true,
			'call': function() {
				d2 = new Date();
				n2 = d2.getTime(); 
	
				sin1 = Math.sin((n2-n)/200)+1.0;
				sin3 = Math.sin((n2-n)/2800)+1.0;
				cos1 = Math.cos((n2-n)/800)+1.0;
				cos2 = Math.cos((n2-n)/2800);
				cos3 = Math.cos((n2-n)/1600);
				cos4 = Math.cos((n2-n)/5711);
				sin2 = Math.sin(sin1*0.05+cos2)+1.0;
				
				rms = params['rms']['value'];
				num = parseInt(params['num']['value'],10);
				red = parseInt(params['red']['value'],10);
			}
		},
		'EFFECT_BACKGROUND': {
			'on': true,
			'call': function() {
						ctx.clearRect(0,0,w,h);
					}
		},
		'EFFECT_DISCO_SQUARES': {
			'on': false,
			'call': function() {
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
					
					
		},
		'EFFECT_SOMETHING_ELSE': {
			'on': false,
			'call': function() {
						
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
		},
		'EFFECT_CENTER_ARCS': {
			'on': false,
			'call': function() {

						var calc = [];
						for(var i=0; i<num; i++) {
							
							ctx.lineWidth = Math.max(1,(i%6)*2+i*sin1*0.025+cos2*2+2*sin2);
							//ctx.strokeStyle = "rgba("+red+","+parseInt(((num-i)/num)*255,10)+",10,0.1)";
							ctx.strokeStyle = "hsl("+parseInt(((seedrand*sin2*2+(i/num)*360*cos1*0.25+sin2*i+n2*0.5)%360)*0.5 + 80*sin2,10)+","+parseInt((num-i/num)*100,10)+"%,15%)";
						
							ctx.save();
							ctx.translate(w*0.5,h*0.5);
							ctx.beginPath();
							ctx.arc(0, 0, (200+40*cos1+i*7+50*(i%3)+i*0.25*(cos2+2))%(h*0.5+sin1*4)*2.2, 0, 2 * Math.PI);
							ctx.stroke();
							ctx.restore();
						}
						
					}
		},
		'EFFECT_MDT9K00': {
			'on': false,
			'call': function() {
						ctx.lineWidth = 1;
						ctx.strokeStyle = "rgba(200,100,200,0.5)";
						ctx.save();
						ctx.translate(w*.5,h*.5);
						ctx.rotate((n2-n)*0.0001);
						var parts = 5;
						for (var k=0; k < parts; k++) {
							for(var i=0; i<num*0.15; i++) {
								var sizex = i*(4+cos2*20);
								var sizey = i*(4+cos2*30);
								//ctx.save();
								ctx.beginPath();
								ctx.moveTo(sizex+sin3*100, sizey+sin3*100);
								for (var j=0; j<3; j++) {
									ctx.lineTo(sizex+j*60*cos2+i*50-k*sin3, sizey-j*20*cos2+i*50 + 20*j+i);
								}
								ctx.closePath();
								ctx.stroke();
							}
							ctx.rotate(Math.PI*(2/parts));
						}
						ctx.restore();	
					}
		},
		'EFFECT_MDT9K01': {
			'on': false,
			'call': function() {

						var parts=5;
						var flip = Math.sin(sin1*cos1*cos3);
						
						ctx.lineWidth = 2;
						ctx.strokeStyle = "rgba(255,0,255,0.4)";
						ctx.save();
						ctx.translate(w*(1.0+cos3*0.5)*.5,h*.5);
						ctx.rotate((n2-n)*0.01);
						for (var k=0; k < parts; k++) {
							for(var i=0; i<num; i++) {
								var sizex = i*(4+cos2*20);
								var sizey = i*(4+cos2*30);
								ctx.beginPath();
								ctx.moveTo(sizex+sin3*120, sizey+cos4*100);
								ctx.lineTo(sizex, sizey);
								ctx.closePath();
								ctx.stroke();
							}
							ctx.rotate(Math.PI*(2/parts));
						}
						ctx.restore();
						
						ctx.save();
						ctx.translate(w*(1.0-cos3*0.5)*.5,h*.5);
						ctx.rotate(-(n2-n)*0.01);
						for (var k=0; k < parts; k++) {
							for(var i=0; i<num; i++) {
								var sizex = i*(4+cos2*20);
								var sizey = i*(4+cos2*30);
								//ctx.save();
								ctx.beginPath();
								ctx.moveTo(sizex+sin3*120, sizey+cos4*100);
								ctx.lineTo(sizex, sizey);
								ctx.closePath();
								ctx.stroke();
							}
							ctx.rotate(Math.PI*(2/parts));
						}
						ctx.restore();	
					}
		},
		'EFFECT_MDT9K02': {
			'on': false,
			'call': function() {
						var d = new Date();
						var timer = d.getTime();
						
						var angle = (Math.PI*2)/num;
						var size = 150;
						var opening, phase1, phase2;
						var maxj = 50;
						
						phase1 = timer/25000;
						phase2 = timer/2500;
						
						for (var j=maxj*0.5; j<maxj; j++) {
							var posX = w*(0.5) + Math.sin(phase2*0.25)*j*10;
							var posY = h*(0.5) - Math.cos(phase2*0.25)*j*10;
						
							var thisb = 200 - parseInt(Math.sin(phase2*0.5 + j)*35, 10);
							color = "rgba("+thisb+","+thisb+","+thisb+","+(0.02*((maxj-j)/maxj)+rms*0.15)+")";
							ctx.fillStyle = color;
							var i = parseInt(((Math.sin(phase1) - Math.sin(phase2))+1.0)*0.5*num*0.33,10);
							opening = Math.sin(i*angle)*10 + j*20;
							ctx.save();
							ctx.translate( posX+Math.sin(i*angle+phase1)*opening, posY+Math.cos(i*angle+phase1)*opening );
							ctx.rotate(i*angle+Math.sin(phase2+Math.sin(i*angle)+j*0.5)*3);
							ctx.beginPath();
							ctx.moveTo(-size*.5*j,-size*.5*j);
							ctx.lineTo(0,size);
							ctx.lineTo(size*.5*j,-size*.5*j);
							ctx.fill();
							ctx.closePath();
							ctx.restore();
						}
					}
		}
	}
	
	function drawThis() {
		for(var fx in cv.effects) {
			//console.log(effects[fx]['call']);
			if (cv.effects[fx]['on'] === true) cv.effects[fx]['call']();
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

		//console.log(parsed);
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

document.addEventListener("keydown", keydown, false);

function keydown(e) {
var keyCode = e.keyCode;
console.log(keyCode);
	switch(keyCode) {
		case 39: // right arrow
			effect++;
			if (effect >= 5) effect = 0;
		break;
		case 37: // lefr arrow
			effect--;
			if (effect < 0) effect = 5;
		break;
		case 48: // 0
			cv.effects['EFFECT_BACKGROUND']['on'] = !cv.effects['EFFECT_BACKGROUND']['on'];
		break;
		case 49: // 1
			cv.effects['EFFECT_DISCO_SQUARES']['on'] = !cv.effects['EFFECT_DISCO_SQUARES']['on'];
		break;
		case 50: // 2
			cv.effects['EFFECT_SOMETHING_ELSE']['on'] = !cv.effects['EFFECT_SOMETHING_ELSE']['on'];
		break;
		case 51: // 3
			cv.effects['EFFECT_CENTER_ARCS']['on'] = !cv.effects['EFFECT_CENTER_ARCS']['on'];
		break;
		case 52: // 4
			cv.effects['EFFECT_MDT9K00']['on'] = !cv.effects['EFFECT_MDT9K00']['on'];
		break;
		case 53: // 5
			cv.effects['EFFECT_MDT9K01']['on'] = !cv.effects['EFFECT_MDT9K01']['on'];
		break;
		case 54: // 6
			cv.effects['EFFECT_MDT9K02']['on'] = !cv.effects['EFFECT_MDT9K02']['on'];
		break;
	}
}