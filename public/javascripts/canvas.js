
let showFPS = false;

let cv;
let w;
let h;
let ctx;
let halfw;
let halfh;
let params = {};
let votes = {};
let active_part = 0;

let address = 'http://';

let backgrounds = {};
let spring_ddg = {};
let num_spring_ddg = 24;
let window_frame;
let speedbump = 0.1;

let cl = [
	['UPDATE_TIMERS','Spring1']
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
		
		// activate the ones listed on this part only
		if ('on' in configs[active_part]) {
			for (let j=0; j<configs[active_part]['on'].length; j++) {
				for (fx in cv.effects) {
					if (fx == configs[active_part]['on'][j]) {
						// toggle the effect on
						cv.effects[fx]['on'] = true;
						
						// if there is an initializer, run it
						if ('init' in cv.effects[fx]) cv.effects[fx]['init']();
						
						// add the params from this effect to our global params list
						addToParams(cv.effects[fx]['params']);
						
					}
				}
			}
		}

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
				//'slow': { 'friendly_name': 'Slow Time', 'min': 1.0, 'max': 10.0, 'step': 0.05, 'default_value': 1.0, 'value': 1.0 },
			},
			'call': function() {
				d2 = new Date();
				n2 = d2.getTime(); 
				//let slow = parseFloat(params['slow']['value']);
				timer = (n2-n);///(slow);
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
						let hsl_center = "rgb(222, 220, 206)";
						let hsl_outside = "rgb(122, 120, 106)";

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
				//'bw_linewidth': { 'friendly_name': 'Blue White Linewidth', 'min': 1.0, 'max': 20.0, 'step': 1.0, 'default_value': 10.0, 'value': 10.0 },
				//'bw_scratch': { 'friendly_name': 'Scratch Arc', 'min': 0.0, 'max': 6.28, 'step': 0.01, 'default_value': 0.0, 'value': 3.0 },
				//'bw_radius': { 'friendly_name': 'Arcs Radius', 'min': 0.0, 'max': 6.28, 'step': 0.01, 'default_value': 1.61, 'value': 1.61 }
			},
			'call': function() {

						let bw_linewidth = 10.0; //parseFloat(params['bw_linewidth']['value']);
						let scratch = 3.0; //parseFloat(params['bw_scratch']['value']);
						let bw_radius = 1.61; //parseFloat(params['bw_radius']['value']);
						let bw_btrans = 0.5;
						let bw_wtrans = 0.1;
						
						let segment_length = bw_radius;
						let start_angle = scratch + cos3*0.1 + timer/10000;
						
						let lineWidth = bw_linewidth;
					
						ctx.lineWidth = lineWidth;
						ctx.lineCap = 'round';	
						ctx.strokeStyle = "rgba(200,200,200,"+bw_btrans+")";
						
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
						
						ctx.strokeStyle = "rgba(115,155,255,"+bw_wtrans+")";
						
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
		}/*,
		'EFFECT_METAGENHAIKU': {
			'on': false,
			'params': {
				'wordlist1': { 'friendly_name': 'Wordlist 1', 'possible': ['word1','word2','word3','word4'], 'default_value': 'word1', 'value': 'word1' }
				'wordlist2': { 'friendly_name': 'Wordlist 2', 'min': 0.0, 'max': 6.28, 'step': 0.01, 'default_value': 0.0, 'value': 3.0 },
				'wordlist3': { 'friendly_name': 'Arcs Radius', 'min': 0.0, 'max': 6.28, 'step': 0.01, 'default_value': 1.61, 'value': 1.61 }
			},
			'call': function() {

						let wordlist1 = parseFloat(params['wordlist1']['value']);
						let words = getDiv('words');
						words.innerHTML = wordlist1;
					}
		}*/
	}
	
	for (let v=0; v<num_spring_ddg; v++) {
		spring_ddg[v] = document.getElementById('spring_ddg_'+v);
	}
	
	for (haiku in metagenhaiku['genhaikus']) {
		console.log(haiku);
		
		// load backgrounds
		backgrounds[haiku] = document.getElementById(haiku);
		window_frame = document.getElementById('window_frame');
		
		// load all wordlists
		var thisparams = {};
		for (wordlist in metagenhaiku['genhaikus'][haiku]['wordlists']) {
			console.log(wordlist);
			thisparams[wordlist] = { 'friendly_name': wordlist, 'possible': metagenhaiku['genhaikus'][haiku]['wordlists'][wordlist] };
		}
		
		// add haiku form to effects
		var effect = {'on':false, 'params':thisparams, 'call': function() { 
			//console.log('london calling');
			
			let fw = window_frame.width;
			let fh = window_frame.height;
			
			// window frame aspect ratio
			let imageAspectRatio = fw / fh;
			let canvasAspectRatio = w / h;
			let renderableHeight, renderableWidth, xStart, yStart;
			if(imageAspectRatio < canvasAspectRatio) {
				renderableHeight = h;
				renderableWidth = fw * (renderableHeight / fh);
				xStart = (w - renderableWidth) / 2;
				yStart = 0;
			} else if(imageAspectRatio > canvasAspectRatio) {
				renderableWidth = w;
				renderableHeight = fh * (renderableWidth / fw);
				xStart = 0;
				yStart = (h - renderableHeight) / 2;
			} else {
				renderableHeight = h;
				renderableWidth = w;
				xStart = 0;
				yStart = 0;
			}
			
			let pad = w*0.05;
						
			// background image
			//ctx.drawImage(backgrounds[selected_haiku], 500 + Math.sin(timer*0.0001)*250, 200 + Math.cos(timer*0.0002)*100, renderableWidth*2.5, renderableHeight*2.5, xStart, yStart, renderableWidth, renderableHeight);
			
			if (speedbump > 0.0) speedbump = speedbump * 0.999;
			let index = (parseInt(timer*0.0001+speedbump*500, 10) % num_spring_ddg);
			
			ctx.drawImage(spring_ddg[index], 0, 0, spring_ddg[0].width, spring_ddg[0].height, 0+pad, yStart+pad, renderableWidth-pad*2, renderableHeight-pad*2);
			
			//TODO: test particles
			
			// window frame
			ctx.drawImage(window_frame, 0, yStart, renderableWidth, renderableHeight);

			
			var cardx = w-xStart*0.9*2;
			var cardy = h*0.65;
			var cardw = xStart*0.9*2;
			var cardh = h*0.25;
			var cardpad = w*0.02;
			
			// text frame shadow
			//ctx.fillStyle = 'rgba(15,15,15,0.8)';
			//roundRect(ctx, cardx-w*0.01, cardy+h*0.05, cardw, cardh, 20, true, false);
			
			ctx.fillStyle = 'rgba(255,255,255,1.0)';
			roundRect(ctx, cardx, cardy, cardw, cardh, 60, true, false);
			
			//ctx.fillRect(w-xStart*0.9*2, h*0.8, xStart*0.9*2, h*0.2);
			ctx.fillStyle = 'rgba(250,250,250,1.0)';
			roundRect(ctx, cardx+cardpad, cardy+cardpad, cardw-cardpad*2, cardh-cardpad*2, 30, true, false);

			// bevel
			ctx.save();
			ctx.clip();
			ctx.shadowColor = '#000';
			for(var i=0;i<3;i++){
				for(var j=0;j<3;j++){
					ctx.shadowBlur=4+i;
					ctx.lineWidth=0.50;
					ctx.stroke();
				}
			}
			ctx.restore();
			
			// text
			var haikuforms = metagenhaiku['genhaikus'][selected_haiku]['forms']['Form1'];
			var wordlists = metagenhaiku['genhaikus'][selected_haiku]['wordlists'];
			var output = '';
			var linecounter = 0;
			for (lines in haikuforms) {
				for (words in haikuforms[lines]) {
					var word_ref = haikuforms[lines][words][1];
					//console.log(word_ref);
					var word = '';
					if (word_ref in params) {
						if ('value' in params[word_ref]) {
							if ('value' in params[word_ref]['value']) word = params[word_ref]['value']['value'];
								else word = word_ref;
						}
					}
					//console.log(word);
					output += word + ' ';
				}

				ctx.font="28px Verdana";
				ctx.textAlign="center"; 
				// Create gradient
				//var gradient=ctx.createLinearGradient(0,0,0,w);
				//gradient.addColorStop("0","magenta");
				//gradient.addColorStop("0.5","blue");
				//gradient.addColorStop("1.0","red");
				// Fill with gradient
				ctx.fillStyle='rgba(0,0,0,1.0)';
				ctx.fillText(output, cardx+cardw*0.5, cardy+cardh*0.3 + (linecounter++)*w*0.03);
				output = ''; //+= '<br>';
			}
			
			//console.log(output);
		} };
		this.effects[haiku] = effect;
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

	// for framerate counting
	let lastCalledTime;
	let counter = 0;
	let fpsArray = [];
	
	// main loop
	function animate() {
		//if (this.stop)
		requestAnimationFrame( animate );
		drawThis();
		
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

let selected_haiku = 'Spring1';
let audio = undefined;

function playAudio(source, loop) {
	if (audio) {
		audio.pause();
		delete audio;
	}
	audio = document.createElement('audio');
	audio.setAttribute('src', source);
	audio.setAttribute('autoplay', 'autoplay');
	audio.loop = loop;
	audio.currentTime = 0;
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

let this_websockets = 'ws://'+location.host.split(':')[0];
let this_ws = null;
let this_timeout = false;
let vote_results;

function connectWebSockets() {

	console.log("attempt to connect");
	this_timeout = false;

	this_ws = new WebSocket(this_websockets);        

	this_ws.onopen = function() {
		console.log("opened socket");
		this_ws.sendParameters();
	};
	
	this_ws.sendParameters = function() {
		let obj = {'assisted_performer': 'canvas', 'parameters': params};
		this_ws.send(JSON.stringify(obj));
	};

	this_ws.onmessage = function(evt) {
		//console.log(evt.data);
		let parsed = JSON.parse(evt.data);
		for (instance in parsed) {
			if (instance in params) {
				if (params[instance]['value'] != undefined) {
					if (params[instance]['value']['value'] != undefined) {
						// value changed
						if (parsed[instance]['value'] != undefined) {
							if (params[instance]['value']['value'] != parsed[instance]['value']) {
								speedbump = 0.3;
							}
						}
					}
				} else {
					// first value
					if (parsed[instance]['value'] != undefined) {
						speedbump = 0.3;
					}
				}
				// update params
				params[instance]['value'] = parsed[instance];
			}
		}
		/*if (parsed['vote_results'] != undefined) {
			vote_results = parsed['vote_results'];
		}*/
		
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
		
		case 66: // b
		{
			speedbump = 0.5;
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
    var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
    for (var side in defaultRadius) {
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


var fitImageOn = function(ctx, imageObj) {
	var imageAspectRatio = imageObj.width / imageObj.height;
	var canvasAspectRatio = w / h;
	var renderableHeight, renderableWidth, xStart, yStart;

	// If image's aspect ratio is less than canvas's we fit on height
	// and place the image centrally along width
	if(imageAspectRatio < canvasAspectRatio) {
		renderableHeight = h;
		renderableWidth = imageObj.width * (renderableHeight / imageObj.height);
		xStart = (w - renderableWidth) / 2;
		yStart = 0;
	}

	// If image's aspect ratio is greater than canvas's we fit on width
	// and place the image centrally along height
	else if(imageAspectRatio > canvasAspectRatio) {
		renderableWidth = w;
		renderableHeight = imageObj.height * (renderableWidth / imageObj.width);
		xStart = 0;
		yStart = (h - renderableHeight) / 2;
	}

	// Happy path - keep aspect ratio
	else {
		renderableHeight = h;
		renderableWidth = w;
		xStart = 0;
		yStart = 0;
	}
	ctx.drawImage(imageObj, xStart, yStart, renderableWidth, renderableHeight);
};
