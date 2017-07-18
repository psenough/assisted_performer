
let showFPS = true;

let cv;
let w;
let h;
let ctx;
let halfw;
let halfh;
let params = {};
let votes = {};
let active_part = 0;

//TODO: when layers with the keys, remove parameters from effect being toggled off
//TODO: text overlays sequence easy triggering
//TODO: be able to initialize some effects with certain parameters (sequencer to trigger change of effects and such)

let cl = [
['UPDATE_TIMERS','EFFECT_BACKGROUND','EFFECT_BLUE_WHITE_SEGMENTS','WHO_WANTS_TO_BE_A_DEMOSCENER'],
['UPDATE_TIMERS','EFFECT_BACKGROUND','EFFECT_BLUE_WHITE_SEGMENTS','Q1'],
['UPDATE_TIMERS','EFFECT_BACKGROUND','EFFECT_BLUE_WHITE_SEGMENTS','O1'],
['UPDATE_TIMERS','EFFECT_BACKGROUND','EFFECT_BLUE_WHITE_SEGMENTS','A1'],
['UPDATE_TIMERS','EFFECT_BACKGROUND','EFFECT_BLUE_WHITE_SEGMENTS','Q2'],
['UPDATE_TIMERS','EFFECT_BACKGROUND','EFFECT_BLUE_WHITE_SEGMENTS','O2'],
['UPDATE_TIMERS','EFFECT_BACKGROUND','EFFECT_BLUE_WHITE_SEGMENTS','A2']
];

// not sure if i won't need other stuff stored in the configs struct, so i'll leave it as a struct object for now instead of a plain array
let configs = {};
for (let i=0; i<cl.length; i++) configs[i] = {'on': cl[i] };

window.onload = function(){ init(); };

function init() {
	try {
		connectWebSockets();
	} catch(e) {
		console.log(e);
	}
	cv = new drawCanvas();
	changePart(active_part);
}

function changePart(next_part) {
	//console.log(active_part + ' ' + next_part);
	//console.log(configs);
	if (next_part in configs) {
		// set active part
		active_part = next_part;
		
		console.log('activating part: ' + active_part);
		// clear all params
		params = {};
		
		// clear all active effects
		for (fx in cv.effects) {
			cv.effects[fx]['on'] = false;
		}
		
		// clear all votes
		votes = [];
		
		// activate the ones listed on this part only
		if ('on' in configs[active_part]) {
			for (let j=0; j<configs[active_part]['on'].length; j++) {
				for (fx in cv.effects) {
					if (fx == configs[active_part]['on'][j]) {
						// toggle the effect on
						cv.effects[fx]['on'] = true;
						
						// add the params from this effect to our global params list
						addToParams(cv.effects[fx]['params']);
						
						//
						if (cv.effects[fx]['votes'] != undefined) {
							votes[votes.length] = cv.effects[fx]['votes'];
						}
						
						// skip the rest of the effects, we already found the one we were looking for
						break;
					}
				}
			}
		}
		
		//votes = [{ 'uid': 'tester', 'type': 'single_vote_per_ip', 'options': ['option 1', 'option 2'], 'active': true }, { 'uid': 'tester 2', 'type': 'single_vote_per_ip', 'options': ['opt 1', 'opt 2'], active: false }];
		
		// report the new parameters to the server		
		sendParameters();
	}
}

function addToParams(this_fx_params) {
	// add the params from this effect to our global params list
	for (p in this_fx_params) {
		// only if they are not listed already
		let pexists = false;
		for (ep in params) {
			if (ep == p) {
				pexists = true;
				break;
			}
		}
		// doesnt exist yet, lets add
		if (pexists == false) params[p] = this_fx_params[p];
	}
}

// used on EFFECT_WHITE
function drawShape(centerX, centerY, rotAngle, scaleX, scaleY, posX, posY, angle, size, height, stroke) {
	ctx.strokeStyle = stroke;
	ctx.translate( centerX, centerY );
	ctx.rotate(rotAngle);
	ctx.scale( scaleX, scaleY );
	ctx.translate( posX, posY );
	ctx.rotate(angle);
	ctx.beginPath();
	ctx.moveTo(-size,-size);
	ctx.lineTo(0,height*2);
	ctx.lineTo(size,-size);
	ctx.fill();
	ctx.closePath();
	ctx.stroke();
}

var title = 'Who wants to be a demoscener?!';

let drawCanvas = function() {
	resize();
	
	let seedrand = rand(360);
	let d = d2 = new Date();
	let n = n2 = d.getTime();
	let timer = n2-n;
	let sin1 = Math.sin((n2-n)/200)+1.0;
	let sin3 = Math.sin((n2-n)/2800)+1.0;
	let cos1 = Math.cos((n2-n)/800)+1.0;
	let cos2 = Math.cos((n2-n)/2800);
	let cos3 = Math.cos((n2-n)/1600);
	let cos4 = Math.cos((n2-n)/5711);
	let sin2 = Math.sin(sin1*0.05+cos2)+1.0;
	
	this.effects = {
		'UPDATE_TIMERS': {
			'on': true,
			'params': {
				'slow': { 'friendly_name': 'Slow Time', 'min': 1.0, 'max': 10.0, 'step': 0.05, 'default_value': 1.0, 'value': 1.0 },
			},
			'call': function() {
				d2 = new Date();
				n2 = d2.getTime(); 
				let slow = parseFloat(params['slow']['value']);
				timer = (n2-n)/(slow);
				//TODO: scrub speed without jumping
	
				// precalc some basic sin functions for optimized reuse
				sin1 = Math.sin((timer)/200)+1.0;
				sin3 = Math.sin((timer)/2800)+1.0;
				cos1 = Math.cos((timer)/800)+1.0;
				cos2 = Math.cos((timer)/2800);
				cos3 = Math.cos((timer)/1600);
				cos4 = Math.cos((timer)/5711);
				sin2 = Math.sin(sin1*0.05+cos2)+1.0;
				cos5 = Math.cos((timer)/2000);
			}
		},
		'EFFECT_BACKGROUND': {
			'on': false,
			'params': {
				
			},
			'call': function() {
				
						
						let hsl_center = "rgb(108, 234, 203)";
						let hsl_outside = "rgb(91, 124, 216)";

						let rx = w/Math.sqrt(2);
						let ry = h/Math.sqrt(2);
						let cx = w*0.5;
						let cy = h*0.5;
						
						let scaleX;
						let scaleY;
						let invScaleX;
						let invScaleY;
						let grad;
						
						//If rx or ry is zero, this doesn't create much of a gradient, but we'll allow it in the code, just in case.
						//we will handle these zero lengths by changing them to 0.25 pixel, which will create a gradient indistinguishable from
						//just a solid fill with the outermost gradient color.
						rx = (rx == 0) ? 0.25 : rx;
						rr = (ry == 0) ? 0.25 : ry;
						
						//we create a circular gradient, but after transforming it properly (by shrinking in either the x or y direction),
						//we will have an alliptical gradient.
						if (rx >= ry) {
							scaleX = 1;
							invScaleX = 1;
							scaleY = ry/rx;
							invScaleY = rx/ry;
							grad = ctx.createRadialGradient(cx, cy*invScaleY, 0, cx, cy*invScaleY, rx);
						} else {
							scaleY = 1;
							invScaleY = 1;
							scaleX = rx/ry;
							invScaleX = ry/rx;
							grad = ctx.createRadialGradient(cx*invScaleX, cy, 0, cx*invScaleX, cy, ry);
						}
						
						ctx.fillStyle = grad;
						
						//add desired colors
						grad.addColorStop(0,hsl_center);
						grad.addColorStop(1,hsl_outside);
						
						ctx.save();
						ctx.setTransform(scaleX,0,0,scaleY,0,0);
						ctx.fillRect(0,0,w*invScaleX,h*invScaleY);
						ctx.restore();
					}
		},
		'EFFECT_BLUE_WHITE_SEGMENTS': {
			'on': false,
			'params': {
				'bw_linewidth': { 'friendly_name': 'Blue White Linewidth', 'min': 1.0, 'max': 20.0, 'step': 1.0, 'default_value': 10.0, 'value': 10.0 },
				'bw_scratch': { 'friendly_name': 'Scratch Arc', 'min': 0.0, 'max': 6.28, 'step': 0.01, 'default_value': 0.0, 'value': 3.0 },
				'bw_radius': { 'friendly_name': 'Arcs Radius', 'min': 0.0, 'max': 6.28, 'step': 0.01, 'default_value': 1.61, 'value': 1.61 }
			},
			'call': function() {

						let bw_linewidth = parseFloat(params['bw_linewidth']['value']);
						let scratch = parseFloat(params['bw_scratch']['value']);
						let bw_radius = parseFloat(params['bw_radius']['value']);
						let bw_btrans = 0.5;
						let bw_wtrans = 0.1;
						
						let segment_length = bw_radius;
						let start_angle = scratch + cos3*0.1 + timer/10000;
						
						let lineWidth = bw_linewidth;
					
						ctx.lineWidth = lineWidth;
						ctx.lineCap = 'round';	
						ctx.strokeStyle = "rgba(0,191,214,"+bw_btrans+")";
						
						let radius = 28;
						let narcs = 40;

						ctx.save();
						ctx.translate(w*0.5,h*0.5);
						
						for (let i=0; i<narcs; i++) {
							let r = radius * i;
							ctx.beginPath();
							ctx.arc(0, 0, r, (start_angle * i), (start_angle * i) + segment_length);
							ctx.stroke();
						}
						
						ctx.strokeStyle = "rgba(96,56,73,"+bw_wtrans+")";
						
						//start_angle += Math.PI;
						
						ctx.rotate(Math.PI);
						
						for (let i=0; i<narcs; i++) {
							let r = radius * i;
							ctx.beginPath();
							ctx.arc(0, 0, r, (start_angle * i), (start_angle * i) + segment_length);
							ctx.stroke();
						}
						
						ctx.restore();
						
					}
		},
		/*'EFFECT_FOREGROUND': {
			'on': false,
			'params': {
				'fg_hue': { 'friendly_name': 'Foreground Hue', 'min': 0.0, 'max': 360.0, 'step': 1.0, 'default_value': 150.0, 'value': 150.0 },
				'fg_sat': { 'friendly_name': 'Foreground Saturation', 'min': 0.0, 'max': 100.0, 'step': 1.0, 'default_value': 80.0, 'value': 20.0 },
				'fg_lum': { 'friendly_name': 'Foreground Lightness', 'min': 0.0, 'max': 100.0, 'step': 1.0, 'default_value': 50.0, 'value': 30.0 }
			},
			'call': function() {
				
						let fg_hue = parseFloat(params['fg_hue']['value']);
						let fg_sat = parseFloat(params['fg_sat']['value']);
						let fg_lum = parseFloat(params['fg_lum']['value']);
						
						let hsl = ctx.fillStyle = "hsl("+fg_hue+","+fg_sat+"%,"+fg_lum+"%)";

						let rx = w/Math.sqrt(2);
						let ry = h/Math.sqrt(2);
						let cx = w*0.5;
						let cy = h*0.5;
						
						let scaleX;
						let scaleY;
						let invScaleX;
						let invScaleY;
						let grad;
						
						//If rx or ry is zero, this doesn't create much of a gradient, but we'll allow it in the code, just in case.
						//we will handle these zero lengths by changing them to 0.25 pixel, which will create a gradient indistinguishable from
						//just a solid fill with the outermost gradient color.
						rx = (rx == 0) ? 0.25 : rx;
						rr = (ry == 0) ? 0.25 : ry;
						
						//we create a circular gradient, but after transforming it properly (by shrinking in either the x or y direction),
						//we will have an alliptical gradient.
						if (rx >= ry) {
							scaleX = 1;
							invScaleX = 1;
							scaleY = ry/rx;
							invScaleY = rx/ry;
							grad = ctx.createRadialGradient(cx, cy*invScaleY, 0, cx, cy*invScaleY, rx);
						}
						else {
							scaleY = 1;
							invScaleY = 1;
							scaleX = rx/ry;
							invScaleX = ry/rx;
							grad = ctx.createRadialGradient(cx*invScaleX, cy, 0, cx*invScaleX, cy, ry);
						}
						
						ctx.fillStyle = grad;
						
						//add desired colors
						grad.addColorStop(0,"rgba(0,0,0,0.0)");
						grad.addColorStop(1,hsl);
						
						ctx.save();
						ctx.setTransform(scaleX,0,0,scaleY,0,0);
						ctx.fillRect(0,0,w*invScaleX,h*invScaleY);
						ctx.restore();
					},
		},*/
		'WHO_WANTS_TO_BE_A_DEMOSCENER': {
			'on': true,
			'params': {},
			'call': function() {
						let words = getDiv('words');
						words.innerHTML = title;
					}
		},
		'Q1': {
			'on': true,
			'params': {},
			'call': function() {
						let words = getDiv('words');
						words.innerHTML = getQuestion(0);
					}
		},
		'O1': {
			'on': true,
			'params': {},
			'votes': getVoteStruct(0),
			'call': function() {
						let words = getDiv('words');
						words.innerHTML = getOptions(0);
					}
		},
		'A1': {
			'on': true,
			'params': {},
			'call': function() {
						let words = getDiv('words');
						words.innerHTML = getAnswer(0);
					}
		},
		'Q2': {
			'on': true,
			'params': {},
			'call': function() {
						let words = getDiv('words');
						words.innerHTML = getQuestion(1);
					}
		},
		'O2': {
			'on': true,
			'params': {},
			'call': function() {
						let words = getDiv('words');
						words.innerHTML = getOptions(1);
					}
		},
		'A2': {
			'on': true,
			'params': {},
			'call': function() {
						let words = getDiv('words');
						words.innerHTML = getAnswer(1);
					}
		}
		
	}
	
	function getVoteStruct(id) {
		return { 'uid': 'question'+id, 'title': questions[id]['q'], 'type': 'single_vote_per_ip', 'options': [questions[id]['a'], questions[id]['b'], questions[id]['c'], questions[id]['d']], 'active': true };
	}
	
	function getQuestion(id) {
		return title + '<br><br>' + questions[id]['q'];
	}
	
	function getOptions(id) {
		return title + '<br><br>' + questions[id]['q'] + '<br><br><div id="answera">A) ' + questions[id]['a'] + '</div><div id="answerb">B) ' + questions[id]['b'] + '</div><div id="answerc">C) ' + questions[id]['c'] + '</div><div id="answerd">D) ' + questions[id]['d'] + '</div>';
	}
	
	function getAnswer(id) {
		return title + '<br><br>' + questions[id]['q'] + '<br><br><div id="answera" ' + ((questions[id]['correct']=='a')?'class="correct"':'') +'>A) ' + questions[id]['a'] + '</div><div id="answerb" ' + ((questions[id]['correct']=='b')?'class="correct"':'') +'>B) ' + questions[id]['b'] + '</div><div id="answerc" ' + ((questions[id]['correct']=='c')?'class="correct"':'') + '>C) ' + questions[id]['c'] + '</div><div id="answerd" ' + ((questions[id]['correct']=='d')?'class="correct"':'') +'>D) ' + questions[id]['d'] + '</div>';
	}
	
	function getDiv(id) {
		let words = document.getElementById(id); 
		if (!words) {
			words = document.createElement('div');
			words.setAttribute('id',id);
			document.body.appendChild(words);
		}
		return words;
	}
	
	function drawThis() {
		for(let fx in cv.effects) {
			//console.log(effects[fx]['call']);
			if (cv.effects[fx]['on'] === true) cv.effects[fx]['call']();
		}
	}
	
	requestAnimationFrame( animate );
	
	/*let repeater = n;
	let rperiod = 6000;
	let index = 0;*/
	
	// hack to stop the animation on code to help debug stuff
	//this.stop = false;

	// for framerate counting
	let lastCalledTime;
	let counter = 0;
	let fpsArray = [];
	
	// main loop
	function animate() {
		//if (this.stop)
		requestAnimationFrame( animate );
		drawThis();
		
		/*let dom = document.getElementById('message');
		if (dom) {
			let d2 = new Date();
			let n2 = d2.getTime(); 
			if (((n2-n) > 6000) && (n2-repeater) > rperiod) {
				repeater = n2;
				loadLine('',words[index++]);
				if (index >= words.length) index = 0;
			}
		}*/
		
		// fps counter, taken from https://gist.github.com/C0deMaver1ck/d51659371a345a9327bd
		if (showFPS) {
			let fps;
	
			if (!lastCalledTime) {
				lastCalledTime = new Date().getTime();
				fps = 0;
			}
		
			let delta = (new Date().getTime() - lastCalledTime) / 1000;
			lastCalledTime = new Date().getTime();
			fps = Math.ceil((1/delta));
		
			if (counter >= 60) {
				let sum = fpsArray.reduce(function(a,b) { return a + b });
				let average = Math.ceil(sum / fpsArray.length);
				let dom = document.getElementById("fps"); 
				if (dom) {
					dom.innerHTML = average;
				}
				counter = 0;
				fpsArray = [];
			} else {
				if (fps !== Infinity) {
					fpsArray.push(fps);
				}
				counter++;
			}
		}
	}
}

window.onresize = resize;

function resize() {
	w = window.innerWidth;
	h = window.innerHeight;
	
	let canvas = document.getElementById("canvas");
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
	
	/*let words = document.getElementById("words"); 
	if (!words) {
		words = document.createElement('div');
		words.setAttribute('id','words');
		document.body.appendChild(words);
		words.innerHTML = words_array[words_index];
	}*/
	
	if (showFPS) {
		let fps = document.getElementById("fps"); 
		if (!fps) {
			fps = document.createElement('div');
			fps.setAttribute('id','fps');
			document.body.appendChild(fps);
			fps.innerHTML = '0';
		}
	}
	
}

let this_websockets = 'ws://'+location.host.split(':')[0]+':3001';
let this_ws = null;
let this_timeout = false;

function connectWebSockets() {

	console.log("attempt to connect");
	this_timeout = false;

	this_ws = new WebSocket(this_websockets);        

	this_ws.onopen = function() {
		console.log("opened socket");
		this_ws.sendParameters();
	};
	
	this_ws.sendParameters = function() {
		let obj = {'assisted_performer': 'canvas', 'parameters': params, 'votes': votes};
		this_ws.send(JSON.stringify(obj));
	};

	this_ws.onmessage = function(evt) {
		//console.log(evt.data);
		let parsed = JSON.parse(evt.data);
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

function initAudio() {
    /*let irRRequest = new XMLHttpRequest();
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
    /*let audioSelect = document.getElementById("audioinput");
    while (audioSelect.firstChild)
        audioSelect.removeChild(audioSelect.firstChild);

    for (let i = 0; i != sourceInfos.length; ++i) {
        let sourceInfo = sourceInfos[i];
        if (sourceInfo.kind === 'audio') {
            let option = document.createElement("option");
            option.value = sourceInfo.id;
            option.text = sourceInfo.label || 'input ' + (audioSelect.length + 1);
            audioSelect.appendChild(option);
        }
    }
    audioSelect.onchange = changeInput;*/
}

document.addEventListener("keydown", keydown, false);

function keydown(e) {
let keyCode = e.keyCode;
console.log(keyCode);
	switch(keyCode) {
		case 39: // right arrow
			// only change part if there are no words on screen
			//if (words_array[words_index] == "") {
				active_part++;
				if (active_part >= arraySize(configs)) active_part = 0;
				changePart(active_part);
			//}
		break;
		case 37: // left arrow
			// only change part if there are no words on screen
			//if (words_array[words_index] == "") {
				active_part--;
				if (active_part < 0) active_part = arraySize(configs)-1;
				changePart(active_part);
			//}
		break;
		case 48: // 0
			toggleOnOff('EFFECT_BACKGROUND');
			sendParameters();
		break;
		case 189: // '
			toggleOnOff('EFFECT_FOREGROUND');
			sendParameters();
		break;
		case 49: // 1
			toggleOnOff('EFFECT_RED_STARS');
			sendParameters();
		break;
		case 50: // 2
			toggleOnOff('EFFECT_CENTERED_CIRCLES');
			sendParameters();
		break;
		case 51: // 3
			toggleOnOff('EFFECT_PINK_SPYRAL');
			sendParameters();
		break;
		case 52: // 4
			toggleOnOff('EFFECT_RANDOM_LINES');
			sendParameters();
		break;
		case 53: // 5
			toggleOnOff('EFFECT_GOLDEN_ROTORS');
			sendParameters();
		break;
		case 54: // 6
			toggleOnOff('EFFECT_WHITE');
			sendParameters();
		break;
		case 55: // 7
			toggleOnOff('EFFECT_SINE_LINES');
			sendParameters();
		break;
		case 56: // 8
			toggleOnOff('EFFECT_CROSSBARS');
			sendParameters();
		break;
		case 57: // 9
			toggleOnOff('EFFECT_WALKERS');
			sendParameters();
		break;
		
		case 81: // q
			toggleOnOff('EFFECT_BLUE_WHITE_SEGMENTS');
			sendParameters();
		break;
		
		case 86: // v
		{
			votes = [{ 'uid': 'tester', 'type': 'single_vote_per_ip', 'options': ['option 1', 'option 2'], 'active': true }, { 'uid': 'tester 2', 'type': 'single_vote_per_ip', 'options': ['opt 1', 'opt 2'], active: false }];
			sendParameters();
		}
		break;
		
		case 32: // spacebar
		{
			let words = document.getElementById("words"); 
			if (words) {
				words_index++;
				if (words_index >= words_array.length) words_index = 0;
				words.innerHTML = words_array[words_index];
			}
		}
		break;
		
		case 8: // backspace
		{
			let words = document.getElementById("words"); 
			if (words) {
				words_index--;
				if (words_index < 0) words_index = words_array.length-1;
				words.innerHTML = words_array[words_index];
			}
		}
		break;
		
		/*case 72: // h
			//TODO: hide text with ip adress
			let ip = document.getElementById("ip"); 
			if (ip) {
				if ((ip.className) == '') ip.className = 'hidden';
				 else ip.className = '';
			}
		break;*/
	}
}

function toggleOnOff(fx) {
	cv.effects[fx]['on'] = !cv.effects[fx]['on'];
	if (cv.effects[fx]['on']) addToParams(cv.effects[fx]['params']);
}

function sendParameters() {
	if ((this_ws != null) && (this_ws.readyState == 1)) this_ws.sendParameters();
}

/**
 * Draws a rounded rectangle using the current state of the canvas.
 * If you omit the last three params, it will draw a rectangle
 * outline with a 5 pixel border radius
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate
 * @param {Number} width The width of the rectangle
 * @param {Number} height The height of the rectangle
 * @param {Number} [radius = 5] The corner radius; It can also be an object 
 *                 to specify different radii for corners
 * @param {Number} [radius.tl = 0] Top left
 * @param {Number} [radius.tr = 0] Top right
 * @param {Number} [radius.br = 0] Bottom right
 * @param {Number} [radius.bl = 0] Bottom left
 * @param {Boolean} [fill = false] Whether to fill the rectangle.
 * @param {Boolean} [stroke = true] Whether to stroke the rectangle.
 */
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof stroke == 'undefined') {
    stroke = true;
  }
  if (typeof radius === 'undefined') {
    radius = 5;
  }
  if (typeof radius === 'number') {
    radius = {tl: radius, tr: radius, br: radius, bl: radius};
  } else {
    let defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
    for (let side in defaultRadius) {
      radius[side] = radius[side] || defaultRadius[side];
    }
  }
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
  if (fill) {
    ctx.fill();
  }
  if (stroke) {
    ctx.stroke();
  }

}

rand = function(n){
	return Math.floor(Math.random()*n);
};

arraySize = function(obj) {
    let size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

function listActiveOn() {
	let output = "['";
	for (let fx in cv.effects) {
		if (cv.effects[fx]['on'] == true) output += fx + "','";
	}
	output += "']";
	console.log(output);
}

function isEmpty(obj) {
	return Object.keys(obj).length === 0 && obj.constructor === Object
}

let questions = [
{
	'q': 'According to TPOLM what is your mother?',
	'a': 'A saint',
	'b': 'A devil',
	'c': 'A witch',
	'd': 'A motherfucking giraffe',
	'correct': 'd'
},
{
	'q': 'Which of these is not a Spaceballs release?',
	'a': 'Nine fingers',
	'b': 'Urethra',
	'c': 'Badass 5000',
	'd': 'Last finger'
}

]