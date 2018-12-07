
let showFPS = false;

let cv;
let w;
let h;
let ctx;
let halfw;
let halfh;
let params = {};
let votes = {};
let active_part = 1;
let audio = undefined;

let address = 'http://';

//let backgrounds = {};
//let spring_ddg = {};
//let num_spring_ddg = 24;
let window_frame;
let name_plates;
let speedbump = 0.1;
let zoom_canvas = 1.0;

let cl = [
	['UPDATE_TIMERS']
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
	activateEffect('Autumn1');
	//changePart(active_part);
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

function activateEffect(effect_name) {
	if (selected_haiku == effect_name) {
		console.log(effect_name + ' was already activated');
		return;
	}
	
	console.log('activating ' + effect_name);
	selected_haiku = effect_name;
	
	// clear params
	params = {};
	
	// clear all active effects
	for (fx in cv.effects) {
		cv.effects[fx]['on'] = false;
	}
	
	for (fx in cv.effects) {
		if (fx == effect_name) {
			// toggle the effect on
			cv.effects[fx]['on'] = true;
			
			// if there is an initializer, run it
			if ('init' in cv.effects[fx]) cv.effects[fx]['init']();
			
			// add the params from this effect to our global params list
			addToParams(cv.effects[fx]['params']);
			
		}
	}
	speedbump = 0.3;
	
	// report the new parameters to the server		
	sendParameters();
	
	if (audio != undefined) {
		audio.pause();
		audio.currentTime = 0;
	}
	audio = new Audio( "sounds/" + effect_name + ".wav");
	audio.play();
	audio.loop = true;
}

let sfx = undefined;
let sfx_ended = true;

function playSFX(source) {
	console.log('playing ' + source);
	let sfx = new Audio( "sounds/" + source + ".wav");
	sfx.addEventListener("ended", function() {
          sfx_ended = true;
		  console.log('ended playing');
    });
	sfx.currentTime = 0;
	sfx.loop = false;
	sfx_ended = false;
	sfx.play();
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

let bg_ddg = {};
let previndex = undefined;

let drawCanvas = function() {
	resize();
	
	let d = d2 = new Date();
	let n = n2 = d.getTime();
	let timer = n2-n;
	
	this.effects = {};
	
	for (haiku in metagenhaiku['genhaikus']) {
		console.log(haiku);
		
		window_frame = document.getElementById('window_frame');
		name_plates = document.getElementById('name_plates');
		
		// load all wordlists
		var thisparams = {};
		for (wordlist in metagenhaiku['genhaikus'][haiku]['wordlists']) {
			//console.log(wordlist);
			var wtym =  metagenhaiku['genhaikus'][haiku]['wordlists'][wordlist];
			var rvalue = wtym[rand(wtym.length)];
			if (wtym.length > 1) thisparams[wordlist] = { 'friendly_name': wordlist, 'possible': wtym, 'value': rvalue };
		}
		
		let counter = 0;
		let dom = document.getElementById(haiku.toLowerCase() + '_ddg_' + counter);
		console.log(haiku.toLowerCase() + '_ddg_' + counter);
		let temp_bg_ddg = []; 
		while(dom != undefined) {
			temp_bg_ddg[counter] = dom;
			counter++;
			dom = document.getElementById(haiku.toLowerCase() + '_ddg_' + counter);
		}
		bg_ddg[haiku] = temp_bg_ddg;
		console.log(bg_ddg);
		
		// add haiku form to effects
		var effect = {'on':false, 'params':thisparams, 'call': function() { 
		
			d2 = new Date();
			n2 = d2.getTime(); 
			timer = (n2-n);
			
			let fw = window_frame.width;
			let fh = window_frame.height;
			
			// window frame aspect ratio
			let imageAspectRatio = fw / fh;
			let canvasAspectRatio = w / h;
			let renderableHeight, renderableWidth, xStart, yStart;
			if(imageAspectRatio < canvasAspectRatio) {
				renderableHeight = h;
				renderableWidth = fw * (renderableHeight / fh);
				
				renderableHeight = renderableHeight*zoom_canvas;
				renderableWidth = renderableWidth*zoom_canvas;
				
				xStart = (w - renderableWidth) / 2;
				yStart = 0;
			} else if(imageAspectRatio > canvasAspectRatio) {
				renderableWidth = w;
				renderableHeight = fh * (renderableWidth / fw);
				
				renderableHeight = renderableHeight*zoom_canvas;
				renderableWidth = renderableWidth*zoom_canvas;
				
				xStart = 0;
				yStart = (h - renderableHeight) / 2;
			} else {
				renderableHeight = h;
				renderableWidth = w;
				
				renderableHeight = renderableHeight*zoom_canvas;
				renderableWidth = renderableWidth*zoom_canvas;
				
				xStart = 0;
				yStart = 0;
			}

			let pad = w*0.05;
			
			//
			// background image
			//
			let s_ddg = bg_ddg[selected_haiku];
			if (s_ddg.length == 0) return;
			
			if (speedbump > 0.0) speedbump = speedbump * 0.989;
			let index = (parseInt(timer*0.0001+speedbump*400, 10) % s_ddg.length);
			if (index != previndex) {
				console.log('trying to play while sfx_ended ' + sfx_ended);
				if (sfx_ended == true) playSFX("click"+(index%6));
			}
			previndex = index;
			
			if (selected_haiku == 'Spring1') {
				// hack crop 16:9 images
				ctx.drawImage(s_ddg[index], 100, 0, s_ddg[0].width-200, s_ddg[0].height, 0+pad, yStart+pad, renderableWidth-pad*2, renderableHeight-pad*2);
			} else {
				ctx.drawImage(s_ddg[index], 0, 0, s_ddg[0].width, s_ddg[0].height, 0+pad, yStart+pad, renderableWidth-pad*2, renderableHeight-pad*2);
			}
			
			//TODO: test particles
			
			//
			// window frame
			//
			ctx.drawImage(window_frame, 0, yStart, renderableWidth, renderableHeight);

			//
			// text card frame
			//
			/*var cardx = w-xStart*0.9*2;
			var cardy = h*0.4;
			var cardw = xStart*0.9*2;
			var cardh = h*0.35;
			var cardpad = w*0.01;
			
			drawSideThingie(ctx, cardx, cardy, cardw, cardh, cardpad);*/
			
			
			
			//
			// haiku text on screen
			//
			var haikuforms = metagenhaiku['genhaikus'][selected_haiku]['forms']['Form1'];
			var wordlists = metagenhaiku['genhaikus'][selected_haiku]['wordlists'];
			var output = '';
			var linecounter = 0;
			ctx.font="30px NothingYouCouldDo";
			ctx.textAlign="center"; 
			ctx.fillStyle='rgba(255,255,255,1.0)';
			ctx.shadowColor='rgba(0,0,0,1.0)';
			ctx.lineWidth=5;
			for (lines in haikuforms) {
				for (words in haikuforms[lines]) {
					var word_ref = haikuforms[lines][words][1];
					if (params[word_ref]) {
						word = params[word_ref]['value'];
					} else {
						word = wordlists[word_ref][0];
					}
					output += word + ' ';
				}
				ctx.shadowBlur=7;
				var lin = (linecounter++);
				ctx.strokeText(output, renderableWidth*0.5, renderableHeight*0.7 + lin*w*0.045);
				ctx.shadowBlur=0;
				ctx.fillText(output, renderableWidth*0.5, renderableHeight*0.7 + lin*w*0.045);
				output = '';
			}
			ctx.shadowBlur = 0;
		
			
			//ctx.fillStyle = 'rgba(230,150,20,1.0)';
			//roundRect(ctx, renderableWidth*0.4, renderableHeight*0.89, renderableWidth*0.2, renderableWidth*0.04, 25, true, false);

			ctx.drawImage(name_plates, renderableWidth*0.39, renderableHeight*0.89, renderableWidth*0.22, renderableWidth*0.05);
			
			ctx.font="30px Parisienne";
			ctx.textAlign="center"; 
			ctx.fillStyle='rgba(80,50,20,1.0)';
			ctx.fillText(selected_haiku, renderableWidth*0.5, renderableHeight*0.935);
			
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
	
	function drawSideThingie(ctx, cardx, cardy, cardw, cardh, cardpad) {
		//ctx.fillStyle = 'rgba(15,15,15,0.8)';
		//roundRect(ctx, cardx-w*0.01, cardy+h*0.05, cardw, cardh, 20, true, false);
		
		//ctx.fillStyle = 'rgba(255,255,255,1.0)';
		//roundRect(ctx, cardx, cardy, cardw, cardh, 60, true, false);
		
		// bevel
		/*ctx.save();
		ctx.clip();
		ctx.shadowColor = '#000';
		for(var i=0;i<3;i++){
			for(var j=0;j<3;j++){
				ctx.shadowBlur=4+i;
				ctx.lineWidth=2.0;
				ctx.stroke();
			}
		}
		ctx.restore();*/
		
		ctx.fillStyle = 'rgba(250,250,250,1.0)';
		roundRect(ctx, cardx+cardpad, cardy+cardpad, cardw-cardpad*2, cardh-cardpad*2, 30, true, false);

		// bevel
		ctx.save();
		ctx.clip();
		ctx.strokeStyle = 'rgba(250,250,250,1.0)';
		ctx.shadowColor = '#000';
		for(var i=0;i<3;i++){
			for(var j=0;j<3;j++){
				ctx.shadowBlur=4+i;
				ctx.lineWidth=0.50;
				ctx.stroke();
			}
		}
		ctx.restore();
		
		//
		// haiku text on text card
		//
		var haikuforms = metagenhaiku['genhaikus'][selected_haiku]['forms']['Form1'];
		var wordlists = metagenhaiku['genhaikus'][selected_haiku]['wordlists'];
		var output = '';
		var linecounter = 0;
		ctx.font="14px Verdana";
		ctx.textAlign="center"; 
		ctx.fillStyle='rgba(0,0,0,1.0)';
		for (lines in haikuforms) {
			for (words in haikuforms[lines]) {
				var word_ref = haikuforms[lines][words][1];
				if (params[word_ref]) {
					word = params[word_ref]['value'];
				} else {
					word = wordlists[word_ref][0];
				}
				output += word + ' ';
			}
			ctx.fillText(output, cardx+cardw*0.5, cardy+cardh*0.2 + (linecounter++)*w*0.025);
			output = '';
		}
		
		
		//
		// divider line on text card
		//
		ctx.strokeStyle = 'rgba(0,0,0,1.0)';
		ctx.moveTo(cardx+cardpad*4, cardy+cardh*0.5);
		ctx.lineTo(cardx+cardw-cardpad*4, cardy+cardh*0.5);
		ctx.stroke();

		//
		// router connection text on text card
		//
		ctx.textAlign="left";
		ctx.font="12px Verdana";
		ctx.fillText('Use smartphone to interact', cardx+cardpad*4, cardy+cardh*0.5 + 2*w*0.02);
		//ctx.fillText('Access network "HaikuDream"', cardx+cardpad*2, cardy+cardh*0.5 + 3*w*0.02);
		//ctx.fillText('Visit page http://haiku.dream', cardx+cardpad*2, cardy+cardh*0.5 + 4*w*0.02);
		ctx.fillText('Network "celeiro"', cardx+cardpad*4, cardy+cardh*0.5 + 3*w*0.02);
		ctx.fillText('http://192.168.0.103', cardx+cardpad*4, cardy+cardh*0.5 + 4*w*0.02);	
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

let selected_haiku = '';

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
		canvas.innerHTML = 'canvas';		
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
				//if (params[instance]['value'] != undefined) {
				//	if (params[instance]['value']['value'] != undefined) {
						// value changed
						//if (parsed[instance]['value'] != undefined) {
							if (params[instance]['value'] != parsed[instance]['value']) {
								speedbump = 0.3;
							}
						//}
					//}
				//}
				// update params
				params[instance]['value'] = parsed[instance]['value'];
			}
			if (instance == 'changeseason') {
				//console.log('time for a change');
				var newstyle = randomProperty(metagenhaiku['genhaikus']);
				while (selected_haiku == newstyle) {
					newstyle = randomProperty(metagenhaiku['genhaikus']);
				}
				activateEffect(newstyle);
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

var randomProperty = function (obj) {
    var keys = Object.keys(obj)
    return keys[ keys.length * Math.random() << 0];
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
