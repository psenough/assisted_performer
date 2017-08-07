
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

let address = 'http://192.168.11.1:8080/';

let questions = [
{
	'q': 'How many bytes has a 64kb intro?',
	'a': '64',
	'b': '64,480',
	'c': '65,536',
	'd': '64,000',
	'correct': 'c'
},
{
	'q': 'According to the demoscene, what is a tracker?',
	'a': 'A cool nickname',
	'b': 'A pan-american scener of indigenous descent',
	'c': 'A justifiable reason for a flamewar',
	'd': 'A GPS system',
	'correct': 'c'
},
{
	'q': 'What edition of Evoke is this?',
	'a': 'The second',
	'b': 'The fifth',
	'c': 'The twentieth',
	'd': 'I don\'t know, it\'s my first!',
	'correct': 'c'
},
{
	'q': 'What is Conspiracy\'s most famous theory?',
	'a': 'Atom Theory',
	'b': 'No Showers Theory',
	'c': 'Chaos Theory',
	'd': '64k Theory!',
	'correct': 'c'
},
{
	'q': 'What is the best computer ever?',
	'a': 'Amiga 500',
	'b': 'Amiga 1200',
	'c': 'Amiga CDTV',
	'd': 'AMIGGAAAAAAHHHHHH!!!!!',
	'correct': 'd'
},
{
	'q': 'What is the 1kb category?',
	'a': 'The next 4kb',
	'b': 'The previous 4kb',
	'c': 'Your mother',
	'd': 'Something to do with shaders',
	'correct': 'a'
},
{
	'q': 'According to TPOLM, your mother is what?',
	'a': 'A Saint',
	'b': 'A Devil',
	'c': 'An evil witch',
	'd': 'A motherfucking giraffe',
	'correct': 'd'
},
{
	'q': 'Where does belgian beer come from?',
	'a': 'Trappist monks',
	'b': 'Lots of places in Belgium',
	'c': 'RBBS',
	'd': 'all of the above',
	'correct': 'd'
},
{
	'q': 'Which of these demogroups didn\'t release a production named beertro?',
	'a': 'Calodox',
	'b': 'Energy',
	'c': 'Boozoholics',
	'd': 'Surprise!Productions',
	'correct': 'c'
},
{
	'q': 'Which of these groups never collaborated with farbrausch on a release?',
	'a': 'MFX',
	'b': 'Metalvotze',
	'c': 'Conspiracy',
	'd': 'Jumalauta',
	'correct': 'd'
},
{
	'q': 'Which of these is not a Spaceballs release?',
	'a': 'Nine fingers',
	'b': 'Urethra',
	'c': 'Badass 5000',
	'd': 'Last finger',
	'correct': 'b'
},
{
	'q': 'What was the first production added to the pouet.net database?',
	'a': 'Caillou by Mandarine',
	'b': 'Eden [Explora 2] by Bomb',
	'c': 'Astral Blur by The Black Lotus',
	'd': 'Paper by Psychic Link',
	'correct': 'c'
},
{
	'q': 'Who won 1st place at The Party 92?',
	'a': 'Spaceballs',
	'b': 'Melon Design',
	'c': 'Future Crew',
	'd': 'The first 2 only',
	'correct': 'd'
},
{
	'q': 'What famous demoscener is named Carlos Pardo?',
	'a': 'Made / Bomb',
	'b': 'DJ Uno / Batman Group',
	'c': 'mrdoob',
	'd': 'All of the above',
	'correct': 'a'
},
{
	'q': 'What is/are the origins of the pig?',
	'a': 'A demo',
	'b': 'A demogroup',
	'c': 'A 64kb intro',
	'd': 'a pouet.net meme',
	'correct': 'd'
},
{
	'q': 'According to pouet.net what is the most popular demoscene release of all time?',
	'a': 'Second Reality / Future Crew',
	'b': 'fr-025: the.popular.demo / farbrausch',
	'c': 'fr-041: debris. / farbrausch',
	'd': 'bootchess / RSI',
	'correct': 'c'
},
{
	'q': 'What is the most often used softsynth on 4kb intros?',
	'a': 'oidos',
	'b': 'absynth',
	'c': '4klang',
	'd': 'v2',
	'correct': 'c'
},
{
	'q': 'How many colors has the C-64 palette?',
	'a': '4',
	'b': '8',
	'c': '16',
	'd': 'it depends on the model',
	'correct': 'c'
},
{
	'q': 'Which of the following is not a soundchip?',
	'a': 'YM 2612',
	'b': 'Ricoh 2A03',
	'c': 'MOS 6561',
	'd': 'Agnus',
	'correct': 'd'
}
]

let cl = [
['UPDATE_TIMERS','EFFECT_BACKGROUND','EFFECT_BLUE_WHITE_SEGMENTS','WHO_WANTS_TO_BE_A_DEMOSCENER'],
['UPDATE_TIMERS','EFFECT_BACKGROUND','EFFECT_BLUE_WHITE_SEGMENTS','LADDER_INFO']
];

// append question screens to list of scenes
for (let i=0; i<questions.length; i++) {
cl.push(['UPDATE_TIMERS','EFFECT_BACKGROUND','EFFECT_BLUE_WHITE_SEGMENTS','Q'+i]);
cl.push(['UPDATE_TIMERS','EFFECT_BACKGROUND','EFFECT_BLUE_WHITE_SEGMENTS','O'+i]);
cl.push(['UPDATE_TIMERS','EFFECT_BACKGROUND','EFFECT_BLUE_WHITE_SEGMENTS','A'+i]);
}
/*,
['UPDATE_TIMERS','EFFECT_BACKGROUND','EFFECT_BLUE_WHITE_SEGMENTS','Q1'],
['UPDATE_TIMERS','EFFECT_BACKGROUND','EFFECT_BLUE_WHITE_SEGMENTS','O1'],
['UPDATE_TIMERS','EFFECT_BACKGROUND','EFFECT_BLUE_WHITE_SEGMENTS','A1'],
['UPDATE_TIMERS','EFFECT_BACKGROUND','EFFECT_BLUE_WHITE_SEGMENTS','Q2'],
['UPDATE_TIMERS','EFFECT_BACKGROUND','EFFECT_BLUE_WHITE_SEGMENTS','O2'],
['UPDATE_TIMERS','EFFECT_BACKGROUND','EFFECT_BLUE_WHITE_SEGMENTS','A2']
];*/

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
						
						// if there is an initializer, run it
						if ('init' in cv.effects[fx]) cv.effects[fx]['init']();
						
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

var title = '<b>Who wants to be a demoscener?!</b>';

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
		'WHO_WANTS_TO_BE_A_DEMOSCENER': {
			'on': true,
			'params': {},
			'call': function() {
						let words = getDiv('words');
						words.innerHTML = title;
					}
		},
		'LADDER_INFO': {
			'on': true,
			'params': {},
			'call': function() {
						let words = getDiv('words');
						words.innerHTML = title + '<br>'+address;
						let icon1 = getDiv('icon1');
						icon1.innerHTML = '<img src="/images/Classic5050used.png" width="107px"/>';
						let icon2 = getDiv('icon2');
						icon2.innerHTML = '<img src="/images/ClassicPAFused.png" width="107px" />';
						let icon3 = getDiv('icon3');
						icon3.innerHTML = '<img src="/images/ClassicATAused.png" width="107px" />';
						let icon4 = getDiv('icon4');
						icon4.innerHTML = '<img src="/images/ClassicATA_WIFI_golden.png" width="107px" />';
					}
		}
	}
	
	// append questions to effects list
	for (let i=0; i<questions.length; i++) {
		this.effects['Q'+i] = {
			'on': true,
			'params': {},
			'init': function() {
				let icon1 = document.getElementById('icon1');
				if (icon1) document.body.removeChild(icon1);
				let icon2 = document.getElementById('icon2');
				if (icon2) document.body.removeChild(icon2);
				let icon3 = document.getElementById('icon3');
				if (icon3) document.body.removeChild(icon3);
				let icon4 = document.getElementById('icon4');
				if (icon4) document.body.removeChild(icon4);
			},
			'call': function() {
						let words = getDiv('words');
						words.innerHTML = getQuestion(i);
					}
		};
		this.effects['O'+i] = {
			'on': true,
			'params': {},
			'votes': getVoteStruct(i),
			'call': function() {
						let words = getDiv('words');
						words.innerHTML = getOptions(i);
					}
		};
		this.effects['A'+i] = {
			'on': true,
			'params': {},
			'votes': getVoteStruct(i),
			'call': function() {
						let words = getDiv('words');
						words.innerHTML = getAnswer(i);
					}
		};
	}
	
	function getVoteStruct(id) {
		return { 'uid': 'question'+id, 'title': questions[id]['q'], 'type': 'single_vote_per_ip', 'options': [questions[id]['a'], questions[id]['b'], questions[id]['c'], questions[id]['d']], 'active': true };
	}
	
	function getQuestion(id) {
		return title + '<br>'+address+'<br><br>' + questions[id]['q'];
	}
	
	function getOptions(id) {
		let vr, total, a_w, b_w, c_w, d_w = 0;
		for (let i=0; i<vote_results.length; i++) {
			if (vote_results[i]['uid'] == ('question'+id)) {
				vr = vote_results[i]['results'];
				
				let tt_a = vr[questions[id]['a']]?vr[questions[id]['a']]:0;
				let tt_b = vr[questions[id]['b']]?vr[questions[id]['b']]:0;
				let tt_c = vr[questions[id]['c']]?vr[questions[id]['c']]:0;
				let tt_d = vr[questions[id]['d']]?vr[questions[id]['d']]:0;
				
				total = tt_a + tt_b + tt_c + tt_d;
				a_w = Math.round((tt_a/total)*100)|0;
				b_w = Math.round((tt_b/total)*100)|0;
				c_w = Math.round((tt_c/total)*100)|0;
				d_w = Math.round((tt_d/total)*100)|0;
				
				if (isNaN(a_w)) a_w = 0;
				if (isNaN(b_w)) b_w = 0;
				if (isNaN(c_w)) c_w = 0;
				if (isNaN(d_w)) d_w = 0;
			}
		}
		
		let output = title + '<br>'+address+'<br><br>' + questions[id]['q'] + '<br><br>';
		output += '<div id="answera">A) ' + questions[id]['a'] + '</div><div class="w3-light-grey"><div class="w3-container w3-green" style="width:'+ a_w + '%">'+a_w+'%</div></div>';
		output += '<div id="answerb">B) ' + questions[id]['b'] + '</div><div class="w3-light-grey"><div class="w3-container w3-green" style="width:'+ b_w + '%">'+b_w+'%</div></div>';
		output += '<div id="answerc">C) ' + questions[id]['c'] + '</div><div class="w3-light-grey"><div class="w3-container w3-green" style="width:'+ c_w + '%">'+c_w+'%</div></div>';
		output += '<div id="answerd">D) ' + questions[id]['d'] + '</div><div class="w3-light-grey"><div class="w3-container w3-green" style="width:'+ d_w + '%">'+d_w+'%</div></div>';
		
		return output;
	}
	
	function getAnswer(id) {
		return title + '<br>'+address+'<br><br>' + questions[id]['q'] + '<br><br><div id="answera" ' + ((questions[id]['correct']=='a')?'class="correct"':'') +'>A) ' + questions[id]['a'] + '</div><br><div id="answerb" ' + ((questions[id]['correct']=='b')?'class="correct"':'') +'>B) ' + questions[id]['b'] + '</div><br><div id="answerc" ' + ((questions[id]['correct']=='c')?'class="correct"':'') + '>C) ' + questions[id]['c'] + '</div><br><div id="answerd" ' + ((questions[id]['correct']=='d')?'class="correct"':'') +'>D) ' + questions[id]['d'] + '</div>';
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

let this_websockets = 'ws://'+location.host.split(':')[0]+':3001';
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
		let obj = {'assisted_performer': 'canvas', 'parameters': params, 'votes': votes};
		this_ws.send(JSON.stringify(obj));
	};

	this_ws.onmessage = function(evt) {
		console.log(evt.data);
		let parsed = JSON.parse(evt.data);
		/*for (instance in parsed) {
			if (instance in params) {
				params[instance]['value'] = parsed[instance];
			}
		}*/
		if (parsed['vote_results'] != undefined) {
			vote_results = parsed['vote_results'];
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
