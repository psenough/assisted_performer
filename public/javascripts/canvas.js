
let showFPS = true;

let cv;
let w;
let h;
let ctx;
let halfw;
let halfh;
let params = {};
let active_part = 0;

//TODO: when layers with the keys, remove parameters from effect being toggled off
//TODO: text overlays sequence easy triggering
//TODO: be able to initialize some effects with certain parameters (sequencer to trigger change of effects and such)

let cl = [
['UPDATE_TIMERS','EFFECT_BACKGROUND','EFFECT_PINK_SPYRAL'],
['UPDATE_TIMERS','EFFECT_RED_STARS','EFFECT_PINK_SPYRAL'],
['UPDATE_TIMERS','EFFECT_RED_STARS','EFFECT_PINK_SPYRAL','EFFECT_WHITE'],
['UPDATE_TIMERS','EFFECT_RED_STARS','EFFECT_GOLDEN_ROTORS','EFFECT_WHITE'],
['UPDATE_TIMERS','EFFECT_RED_STARS','EFFECT_RANDOM_LINES','EFFECT_GOLDEN_ROTORS','EFFECT_WHITE'],
['UPDATE_TIMERS','EFFECT_RANDOM_LINES','EFFECT_WHITE'],
['UPDATE_TIMERS','EFFECT_CENTERED_CIRCLES','EFFECT_RANDOM_LINES','EFFECT_WHITE'],
['UPDATE_TIMERS','EFFECT_BACKGROUND','EFFECT_CENTERED_CIRCLES','EFFECT_RANDOM_LINES','EFFECT_WHITE','EFFECT_CROSSBARS','EFFECT_FOREGROUND'],
['UPDATE_TIMERS','EFFECT_RANDOM_LINES','EFFECT_WHITE','EFFECT_CROSSBARS','EFFECT_BLUE_WHITE_SEGMENTS','EFFECT_FOREGROUND'],
['UPDATE_TIMERS','EFFECT_WALKERS','EFFECT_RANDOM_LINES','EFFECT_BLUE_WHITE_SEGMENTS','EFFECT_FOREGROUND'],
['UPDATE_TIMERS','EFFECT_WALKERS','EFFECT_SINE_LINES','EFFECT_BLUE_WHITE_SEGMENTS'],
['UPDATE_TIMERS','EFFECT_RED_STARS','EFFECT_SINE_LINES','EFFECT_BLUE_WHITE_SEGMENTS'],
['UPDATE_TIMERS','EFFECT_CENTERED_CIRCLES','EFFECT_BLUE_WHITE_SEGMENTS','EFFECT_FOREGROUND'],
['UPDATE_TIMERS','EFFECT_BACKGROUND','EFFECT_CENTERED_CIRCLES','EFFECT_PINK_SPYRAL','EFFECT_FOREGROUND']
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
						
						// add the params from this effect to our global params list
						addToParams(cv.effects[fx]['params']);
						
						// skip the rest of the effects, we already found the one we were looking for
						break;
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
				'bg_hue': { 'friendly_name': 'Center Hue', 'min': 0.0, 'max': 360.0, 'step': 1.0, 'default_value': 122.0, 'value': 122.0 },
				'bg_sat': { 'friendly_name': 'Center Saturation', 'min': 0.0, 'max': 100.0, 'step': 1.0, 'default_value': 20.0, 'value': 20.0 },
				'bg_lum': { 'friendly_name': 'Center Lightness', 'min': 0.0, 'max': 100.0, 'step': 1.0, 'default_value': 20.0, 'value': 20.0 },
				'bg2_hue': { 'friendly_name': 'Background Hue', 'min': 0.0, 'max': 360.0, 'step': 1.0, 'default_value': 122.0, 'value': 122.0 },
				'bg2_sat': { 'friendly_name': 'Background Saturation', 'min': 0.0, 'max': 100.0, 'step': 1.0, 'default_value': 20.0, 'value': 0.0 },
				'bg2_lum': { 'friendly_name': 'Background Lightness', 'min': 0.0, 'max': 100.0, 'step': 1.0, 'default_value': 20.0, 'value': 10.0 }
			},
			'call': function() {
				
						let bg_hue = parseFloat(params['bg_hue']['value']);
						let bg_sat = parseFloat(params['bg_sat']['value']);
						let bg_lum = parseFloat(params['bg_lum']['value']);
						let bg2_hue = parseFloat(params['bg2_hue']['value']);
						let bg2_sat = parseFloat(params['bg2_sat']['value']);
						let bg2_lum = parseFloat(params['bg2_lum']['value']);
						
						let hsl_center = "hsl("+bg_hue+","+ bg_sat +"%,"+ bg_lum +"%)";
						let hsl_outside = "hsl("+bg2_hue+","+ bg2_sat +"%,"+ bg2_lum +"%)";

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
		'EFFECT_RED_STARS': {
			'on': true,
			'params': {
				'num_stars': { 'friendly_name': 'Stars Number', 'min': 2.0, 'max': 200.0, 'step': 2.0, 'default_value': 80.0, 'value': 80.0 },
				'red_stars': { 'friendly_name': 'Stars Redness', 'min': 0.0, 'max': 255.0, 'step': 1.0, 'default_value': 122.0, 'value': 122.0 }
			},
			'call': function() {
						let num = parseFloat(params['num_stars']['value']);
						let red = parseFloat(params['red_stars']['value']);
						let sizex = w/num;
						let sizexhalf = parseInt((w/num)*0.5,10);
						let sizey = parseInt(10*(w/h),10);
						
						let r1 = parseInt(red,10);
						if (r1 > 255) r1 = 255;
						if (r1 < 0) r1 = 0;
						ctx.fillStyle = "rgba("+r1+",0,0,1.0)";
						
						for(let i=1; i<num; i++) {
							let ydrift = i*cos2 + sin3*((num-i)*i)*20 + (i+10)*sin1/(cos3+500);
							
							let posx = parseInt(i*sizex,10);
							let posy = parseInt((w*0.25+ydrift)%w,10);
							roundRect(ctx, posx, posy, sizexhalf, sizey, 5, true, false);
							
							posy = parseInt((w*0.5+ydrift)%w,10);
							roundRect(ctx, posx, posy, sizexhalf, sizey, 3+20*sin2, true, false);
							
							posy = parseInt((w*0.75+ydrift)%w,10);
							roundRect(ctx, posx, posy, sizexhalf, sizey, 10*sin1, true, false);
							
							posy = parseInt((w+ydrift)%w,10);
							roundRect(ctx, posx, posy, sizexhalf, sizey, 10*cos3, true, false);
						}
					}					
		},
		'EFFECT_WALKERS': {
			'on': true,
			'params': {
				'otrans': { 'friendly_name': 'Orange Transparency', 'min': 0.0, 'max': 1.0, 'step': 0.01, 'default_value': 0.5, 'value': 0.5 },
				'ctrans': { 'friendly_name': 'Cyan Transparency', 'min': 0.0, 'max': 1.0, 'step': 0.01, 'default_value': 0.5, 'value': 0.5 }
			},
			'call': function() {
	
						let wcolumns = 0|(w*.0175);
						let wlines = 0|(h*.015);

						let colwidth = w/wcolumns;
						let linspace = h/wlines;
						
						let orange_trans = parseFloat(params['otrans']['value']);
						let cyan_trans = parseFloat(params['ctrans']['value']);
						
						color2 = "rgba(255,200,100,"+orange_trans+")";
						color3 = "rgba(88,254,250,"+cyan_trans+")";
						
						ctx.lineCap = 'round';

						let lW2 = Math.sin(timer/1000)*10+18;
						
						for(let i=0;i<=wcolumns;i++) {
							for(let j=0;j<=wlines;j++) {
								let floatingx = colwidth*i;
								let floatingy = linspace*j;
								let halfsize = colwidth*.5;
								if (rand(2) == 0) {
										ctx.strokeStyle = color3;
										ctx.lineWidth = lW2;
										ctx.beginPath();
										ctx.moveTo(floatingx-halfsize, floatingy-halfsize);	
										ctx.lineTo(floatingx+halfsize, floatingy+halfsize);
										ctx.stroke();
								} else {
										ctx.strokeStyle = color2;
										ctx.lineWidth = lW2;
										ctx.beginPath();
										ctx.moveTo(floatingx+halfsize, floatingy-halfsize);	
										ctx.lineTo(floatingx-halfsize, floatingy+halfsize);
										ctx.stroke();
								}
							}
						}
						
					}
		},
		'EFFECT_CENTERED_CIRCLES': {
			'on': false,
			'params': {
				'circles_num': { 'friendly_name': 'Circles Number', 'min': 10.0, 'max': 20.0, 'step': 1.0, 'default_value': 10.0, 'value': 20.0 },
				'circles_light': { 'friendly_name': 'Circles Lightness', 'min': 0.0, 'max': 100.0, 'step': 1.0, 'default_value': 20.0, 'value': 20.0 },
				'circles_trans': { 'friendly_name': 'Circles Transparency', 'min': 0.0, 'max': 1.0, 'step': 0.01, 'default_value': 1.0, 'value': 1.0 },
				'circles_size': { 'friendly_name': 'Circles Line Width', 'min': 1.0, 'max': 40.0, 'step': 1.0, 'default_value': 3.0, 'value': 3.0 },
			},
			'call': function() {
				
				function getFloatParam(param) {
					return parseFloat(params[param]['value']);
				}
						let calc = [];
						let anum = parseFloat(params['circles_num']['value']);
						let lightness = parseFloat(params['circles_light']['value']);
						let alpha = parseFloat(params['circles_trans']['value']);
						let base = parseFloat(params['circles_size']['value']);

						for (let i=0; i<anum; i++) {
							ctx.lineWidth = Math.max(base,(i%6)*2+i*sin1*0.025+cos2*2+2*sin2 + base);
							//ctx.strokeStyle = "rgba("+red+","+parseInt(((num-i)/num)*255,10)+",10,0.1)";
							ctx.strokeStyle = "hsla("+parseInt(((seedrand*sin2*2+(i/anum)*360*cos1*0.25+sin2*i+n2*0.5)%360)*0.5 + 80*sin2,10)+","+parseInt((anum-i/anum)*100,10)+"%,"+lightness+"%,"+alpha+")";
						
							ctx.save();
							ctx.translate(w*0.5,h*0.5);
							ctx.beginPath();
							ctx.arc(0, 0, (800+140*cos1+i*7+50*(i%3)+i*0.25*(cos2+2))%(h*0.5+sin1*4)*2.2, 0, 2 * Math.PI);
							ctx.stroke();
							ctx.restore();
						}
						
					}
		},
		'EFFECT_PINK_SPYRAL': {
			'on': false,
			'params': {
				'num_spyral': { 'friendly_name': 'Pink Spyral Triangles', 'min': 2.0, 'max': 25.0, 'step': 2.0, 'default_value': 12.0, 'value': 10.0 },
				//'lw_spyral': { 'friendly_name': 'Pink Line Width', 'min': 1.0, 'max': 20.0, 'step': 1.0, 'default_value': 2.0, 'value': 2.0 },
				'parts_spyral': { 'friendly_name': 'Pink Spyral Sections', 'min': 3.0, 'max': 25.0, 'step': 1.0, 'default_value': 5.0, 'value': 5.0 },
				'twist_spyral': { 'friendly_name': 'Pink Spyral Twist', 'min': 0.0, 'max': 30.0, 'step': 0.05, 'default_value': 10.0, 'value': 10.0 },
				'center_spyral': { 'friendly_name': 'Pink Spyral Pivot', 'min': 0.0, 'max': 200.0, 'step': 1.0, 'default_value': 100.0, 'value': 100.0 },
				'bend_spyral': { 'friendly_name': 'Pink Spyral Bend', 'min': 2.0, 'max': 10.0, 'step': 1.0, 'default_value': 8.0, 'value': 8.0 }

			},
			'call': function() {
						let num = parseFloat(params['num_spyral']['value']);
						let lw = 2; //parseFloat(params['lw_spyral']['value']);
						let parts = parseFloat(params['parts_spyral']['value']);
						let twist = parseFloat(params['twist_spyral']['value']);
						let center = parseFloat(params['center_spyral']['value']);
						let bend = parseFloat(params['bend_spyral']['value']);

						ctx.lineWidth = lw;
						ctx.strokeStyle = "rgba(200,100,200,0.5)";
						ctx.lineJoin = "round";
						ctx.save();
						ctx.translate(w*.5,h*.5);
						ctx.rotate((n2-n)*0.0001);
						
						for (let k=0; k<parts; k++) {
							for(let i=0; i<num; i++) {
								let sizex = -center+i*(4+cos2*20+sin1*0.02*k);
								let sizey = -center+i*(4+cos2*(20+twist)-sin1*0.02*k);
								ctx.beginPath();
								ctx.moveTo(sizex+sin3*10, sizey+sin3*200);
								for (let j=0; j<bend; j++) {
									ctx.lineTo(sizex+(j%3)*60*cos2+i*50, sizey-j*20*cos2+i*50 + 20*(j%2)+i);
								}
								ctx.closePath();
								ctx.stroke();
							}
							ctx.rotate(Math.PI*(2/parts));
						}
						ctx.restore();	
					}
		},
		'EFFECT_RANDOM_LINES': {
			'on': false,
			'params': {
				'num_lines': { 'friendly_name': 'Number Lines', 'min': 2.0, 'max': 200.0, 'step': 2.0, 'default_value': 80.0, 'value': 80.0 },
			},
			'call': function() {
						let num = parseFloat(params['num_lines']['value']);
						let calc = [];
						let i=0;
						
						for(i=0; i<num; i++) {
							calc[i] = [];
							calc[i]['x'] = rand(w);
							calc[i]['y'] = rand(h);
							calc[i]['rot'] = rand(180);
						}
						
						let sizex = w/num;
						let sizexhalf = parseInt((w/num)*0.5,10);
						let sizey = parseInt(10*(w/h),10);
						
						ctx.lineCap = 'round';
						ctx.strokeStyle = "rgba(0,0,0,0.25)";

						ctx.beginPath();
						ctx.moveTo(calc[0]['x'], calc[0]['y']);
						for(i=1; i<num; i++) {
							ctx.lineWidth = Math.max(1,(i%6)*2+i*sin1*0.025+cos2*2+2*sin2);
							ctx.lineTo(calc[i]['x'], calc[i]['y']);
						}
						ctx.closePath();
						ctx.stroke();
					}
		},
		'EFFECT_GOLDEN_ROTORS': {
			'on': false,
			'params': {
				'num_rotors': { 'friendly_name': 'Number Rotor Lines', 'min': 2.0, 'max': 200.0, 'step': 2.0, 'default_value': 80.0, 'value': 80.0 },
				'rotors_speed': { 'friendly_name': 'Rotors Speed', 'min': 0.0, 'max': 5.0, 'step': 0.05, 'default_value': 0.6, 'value': 0.6 }
			},
			'call': function() {

						let parts = 3;
						let flip = Math.sin(sin1*cos1*cos3);
						let rotors_speed = parseFloat(params['rotors_speed']['value']);
						let num = parseFloat(params['num_rotors']['value']);
						
						ctx.lineWidth = 2;
						ctx.strokeStyle = "rgba(200,200,5,0.4)";
						ctx.save();
						ctx.translate(w*(1.0+cos3*0.5)*.5,h*.5);
						ctx.rotate((n2-n)*0.01*rotors_speed);
						for (let k=0; k < parts; k++) {
							for(let i=0; i<num*0.5; i++) {
								let sizex = i*(4+cos2*20);
								let sizey = i*(4+cos2*30);
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
						ctx.rotate(-(n2-n)*0.01*rotors_speed);
						for (let k=0; k < parts; k++) {
							for(let i=0; i<num*0.5; i++) {
								let sizex = i*(4+cos2*20);
								let sizey = i*(4+cos2*30);
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
		'EFFECT_WHITE': {
			'on': false,
			'params': {
				'white_count': { 'friendly_name': 'White Count', 'min': 1.0, 'max': 50.0, 'step': 1.0, 'default_value': 20.0, 'value': 20.0 },
				'white_size': { 'friendly_name': 'White Size', 'min': 1.0, 'max': 50.0, 'step': 1.0, 'default_value': 20.0, 'value': 20.0 },
				'black_contour': { 'friendly_name': 'Black Contour', 'min': 0.0, 'max': 1.0, 'step': 0.01, 'default_value': 0.0, 'value': 0.0 }
			},
			'call': function() {
						let size = parseFloat(params['white_size']['value']);
						let maxj = parseFloat(params['white_count']['value']);
						let black_contour = parseFloat(params['black_contour']['value']);

						let angle = 0.0; //(Math.PI*2)/num;

						let opening, phase1, phase2;
						
						phase1 = timer/25000;
						phase2 = timer/2500;
						ctx.lineJoin = "round";
						
						let seedindex = rand(3928896423);
						let clip = false;
						let centerX = w*0.5;
						let centerY = h*0.5;
						let oangle = Math.asin( centerX / Math.sqrt(centerX*centerX+centerY*centerY) ) * 2;
						
						let diagonal = 105 + sin3;
						let stroke = "rgba(0,0,0,"+black_contour+")";
		
						for (let j=0; j<maxj; j++) {
						
							let thisb = parseInt(Math.sin(phase2*0.5 + j)*35+120, 10);
							color = "rgba(255,255,255,"+(0.12*((maxj-j)/maxj))+")";
							ctx.fillStyle = color;
							let i = seedindex;
							opening = j*30 + sin3*20 + sin1*10 ;
							
							ctx.save();
							
							// clip top-left
							if (clip) {
								ctx.beginPath();
								ctx.moveTo(0,0);
								ctx.lineTo(centerX,0);
								ctx.lineTo(centerX,centerY);
								ctx.clip();
								ctx.closePath();
							}
						
							drawShape( 	centerX, centerY, 0,
										1.0, 1.0,
										Math.sin(i*angle+phase1)*opening - diagonal, Math.cos(i*angle+phase1)*opening - diagonal,
										i*angle+Math.sin(phase2+Math.sin(i*angle)+j*0.5)*3,
										size*.5*j,
										size,
										stroke);
							
							ctx.restore();

							ctx.save();
							
							// clip top-right
							if (clip) {
								ctx.beginPath();
								ctx.moveTo(centerX,0);
								ctx.lineTo(w,0);
								ctx.lineTo(centerX,centerY);
								ctx.clip();
							}
										
							drawShape( 	centerX, centerY, 0,
										-1.0, 1.0,
										Math.sin(i*angle+phase1)*opening - diagonal, Math.cos(i*angle+phase1)*opening - diagonal,
										i*angle+Math.sin(phase2+Math.sin(i*angle)+j*0.5)*3,
										size*.5*j,
										size,
										stroke);
							
							ctx.restore();

							ctx.save();
							
							// clip right-top
							if (clip) {
								ctx.beginPath();
								ctx.moveTo(centerX,centerY);
								ctx.lineTo(w,0);
								ctx.lineTo(w,centerY);
								ctx.clip();
							}
										
							drawShape( 	centerX, centerY, oangle,
										1.0, 1.0,
										Math.sin(i*angle+phase1)*opening - diagonal, Math.cos(i*angle+phase1)*opening - diagonal,
										i*angle+Math.sin(phase2+Math.sin(i*angle)+j*0.5)*3,
										size*.5*j,
										size,
										stroke);
							
							ctx.restore();

							ctx.save();
							
							// clip right-bottom
							if (clip) {
								ctx.beginPath();
								ctx.moveTo(centerX,centerY);
								ctx.lineTo(w,centerY);
								ctx.lineTo(w,h);
								ctx.clip();
							}
										
							drawShape( 	centerX, centerY, -oangle,
										1.0, -1.0,
										Math.sin(i*angle+phase1)*opening - diagonal, Math.cos(i*angle+phase1)*opening - diagonal,
										i*angle+Math.sin(phase2+Math.sin(i*angle)+j*0.5)*3,
										size*.5*j,
										size,
										stroke);
							
							ctx.restore();
							
							ctx.save();
							// clip bottom-left
							if (clip) {
								ctx.beginPath();
								ctx.moveTo(0,h);
								ctx.lineTo(centerX,centerY);
								ctx.lineTo(centerX,h);
								ctx.clip();
							}
										
							drawShape( 	centerX, centerY, 0,
										1.0, -1.0,
										Math.sin(i*angle+phase1)*opening - diagonal, Math.cos(i*angle+phase1)*opening - diagonal,
										i*angle+Math.sin(phase2+Math.sin(i*angle)+j*0.5)*3,
										size*.5*j,
										size,
										stroke);
							
							ctx.restore();

							ctx.save();
							// clip bottom-right
							if (clip) {
								ctx.beginPath();
								ctx.moveTo(centerX,centerY);
								ctx.lineTo(w,h);
								ctx.lineTo(centerX,h);
								ctx.clip();
							}
										
							drawShape( 	centerX, centerY, 0,
										-1.0, -1.0,
										Math.sin(i*angle+phase1)*opening - diagonal, Math.cos(i*angle+phase1)*opening - diagonal,
										i*angle+Math.sin(phase2+Math.sin(i*angle)+j*0.5)*3,
										size*.5*j,
										size,
										stroke);
							
							ctx.restore();

							ctx.save();
							
							// clip right-bottom
							if (clip) {
								ctx.beginPath();
								ctx.moveTo(centerX,centerY);
								ctx.lineTo(0,h);
								ctx.lineTo(0,centerY);
								ctx.clip();
							}
										
							drawShape( 	centerX, centerY, oangle,
										-1.0, -1.0,
										Math.sin(i*angle+phase1)*opening - diagonal, Math.cos(i*angle+phase1)*opening - diagonal,
										i*angle+Math.sin(phase2+Math.sin(i*angle)+j*0.5)*3,
										size*.5*j,
										size,
										stroke);
							
							ctx.restore();
							
							ctx.save();
							
							// clip right-top
							if (clip) {
								ctx.beginPath();
								ctx.moveTo(centerX,centerY);
								ctx.lineTo(0,centerY);
								ctx.lineTo(0,0);
								ctx.clip();
							}
										
							drawShape( 	centerX, centerY, -oangle,
										-1.0, 1.0,
										Math.sin(i*angle+phase1)*opening - diagonal, Math.cos(i*angle+phase1)*opening - diagonal,
										i*angle+Math.sin(phase2+Math.sin(i*angle)+j*0.5)*3,
										size*.5*j,
										size,
										stroke);
							
							ctx.restore();
						
					}
			}
		},
		'EFFECT_SINE_LINES': {
			'on': false,
			'params': {
				'num_tlines': { 'friendly_name': 'Number Trail Lines', 'min': 2.0, 'max': 100.0, 'step': 2.0, 'default_value': 40.0, 'value': 40.0 },
				'num_tsegments': { 'friendly_name': 'Number Segments', 'min': 2.0, 'max': 100.0, 'step': 2.0, 'default_value': 40.0, 'value': 40.0 },
				'sine_line_width': { 'friendly_name': 'Sinus Line Width', 'min': 1.0, 'max': 20.0, 'step': 1.0, 'default_value': 5.0, 'value': 5.0 },
				'rtrans': { 'friendly_name': 'Sinus Red Transparency', 'min': 0.0, 'max': 1.0, 'step': 0.01, 'default_value': 0.5, 'value': 0.5 }

			},
			'call': function() {

						let num_tlines = parseFloat(params['num_tlines']['value']);
						let num_tsegments = parseFloat(params['num_tsegments']['value']);
						let sine_line_width = parseFloat(params['sine_line_width']['value']);
						let rtrans = parseFloat(params['rtrans']['value']);
						
						ctx.lineWidth = sine_line_width;

						for (let i=0; i<num_tlines; i++) {
							ctx.save();
							
							ctx.translate(w*.5 + Math.sin(i + cos3)*w*.5, - Math.sin(i + cos2 + sin2*cos1)*20 + Math.sin(i*sin2)*50);
							
							ctx.strokeStyle = "rgba(120,0,0,"+rtrans+")";
							ctx.beginPath();
							ctx.moveTo(0,0);
							for (let j=1; j<num_tsegments; j++) {
								ctx.lineTo(Math.sin(j + cos2*30 + sin1*20)*10, j*(h/(num_tsegments)));
							}
							ctx.stroke();
							ctx.restore();
						}
						
					}
		},
		'EFFECT_BLUE_WHITE_SEGMENTS': {
			'on': false,
			'params': {
				'bw_linewidth': { 'friendly_name': 'Blue White Linewidth', 'min': 1.0, 'max': 20.0, 'step': 1.0, 'default_value': 10.0, 'value': 10.0 },
				'bw_scratch': { 'friendly_name': 'Scratch Arc', 'min': 0.0, 'max': 6.28, 'step': 0.01, 'default_value': 0.0, 'value': 0.0 },
				'bw_radius': { 'friendly_name': 'Arcs Radius', 'min': 0.0, 'max': 6.28, 'step': 0.01, 'default_value': 1.61, 'value': 1.61 },
				'bw_btrans': { 'friendly_name': 'Blue Arcs Transparency', 'min': 0.0, 'max': 1.0, 'step': 0.01, 'default_value': 0.5, 'value': 0.5 },
				'bw_wtrans': { 'friendly_name': 'White Arcs Transparency', 'min': 0.0, 'max': 1.0, 'step': 0.01, 'default_value': 0.5, 'value': 0.5 },

			},
			'call': function() {

						let bw_linewidth = parseFloat(params['bw_linewidth']['value']);
						let scratch = parseFloat(params['bw_scratch']['value']);
						let bw_radius = parseFloat(params['bw_radius']['value']);
						let bw_btrans = parseFloat(params['bw_btrans']['value']);
						let bw_wtrans = parseFloat(params['bw_wtrans']['value']);
						
						let segment_length = bw_radius;
						let start_angle = scratch + cos3 + timer/2000;
						
						let lineWidth = bw_linewidth;
					
						ctx.lineWidth = lineWidth;
						ctx.lineCap = 'round';	
						ctx.strokeStyle = "rgba(0,0,220,"+bw_btrans+")";
						
						let radius = 22;
						let narcs = 35;

						ctx.save();
						ctx.translate(w*0.5,h*0.5);
						
						for (let i=0; i<narcs; i++) {
							let r = radius * i;
							ctx.beginPath();
							ctx.arc(0, 0, r, (start_angle * i), (start_angle * i) + segment_length);
							ctx.stroke();
						}
						
						ctx.strokeStyle = "rgba(220,220,220,"+bw_wtrans+")";
						
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
		'EFFECT_CROSSBARS': {
			'on': false,
			'params': {},
			'call': function() {

						//TODO: expose some parameters in this effect
						
						let columns = 2;
						let lines = 10;
						let colwidth = w/columns;
						let linspace = h/lines;
						let timer = n2-n;
						let note = rand(255);
						
						ctx.save();
						ctx.translate(0,0);

						ctx.lineWidth = colwidth + Math.sin(timer/1000)*colwidth;
						for(let i=0;i<columns+1;i++) {
							let grad1 = rand(255-note);
							color2 = "rgba("+grad1+","+grad1+","+grad1+",.15)";
							ctx.strokeStyle = color2;
							let floatingx = colwidth*i;
							ctx.beginPath();
							ctx.moveTo(floatingx, 0);	
							ctx.lineTo(floatingx, h);
							ctx.stroke();
							ctx.closePath();							
						}

						ctx.lineWidth = linspace + Math.sin(timer/1000+500)*linspace;				
						for(let j=0;j<lines+1;j++) {
							let grad1 = rand(255-note);
							color2 = "rgba("+grad1+","+grad1+","+grad1+",.15)";
							ctx.strokeStyle = color2;
							let floatingy = linspace*j;
							ctx.beginPath();
							ctx.moveTo(0, floatingy);	
							ctx.lineTo(w, floatingy);
							ctx.stroke();
							ctx.closePath();							
						}
						ctx.restore();
						
					}
		},
		'EFFECT_FOREGROUND': {
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
					}
		}
		
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
	
	let words = document.getElementById("words"); 
	if (!words) {
		words = document.createElement('div');
		words.setAttribute('id','words');
		document.body.appendChild(words);
		words.innerHTML = words_array[words_index];
	}
	
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

function loadLine(thisclass, thistext) {
	//let content = '';
	//content += '<span class="'+thisclass+'">'+thistext+'</span><br />';
	//document.getElementById('message').innerHTML = content;
}

let words_index = 0;
let words_array = [
"http://192.168.1.70:70",
"",
"there is, in cyberspace",
"",
"there is a star shaped line",
"there is a star shaped line<br>swirling in my head",
"there is a star shaped line<br>swirling in my head<br>bending itself",
"there is a star shaped line<br>swirling in my head<br>bending itself<br>twisting",
"",
"there is a red waterfall",
"there is a red waterfall<br>melting everything",
"there is a red waterfall<br>melting everything<br>draping my world",
"there is a red waterfall<br>melting everything<br>draping my world<br>into a thick dark cloud",
"",
"there is a hidden light",
"there is a hidden light<br>a deep deep well",
"there is a hidden light<br>a deep deep well<br>obfuscating me",
"there is a hidden light<br>a deep deep well<br>obfuscating me<br>a well without depth",
"",
"there is a golden spindle",
"there is a golden spindle<br>tumbling me down down down",
"there is a golden spindle<br>tumbling me down down down<br>through that bright deep well",
"there is a golden spindle<br>tumbling me down down down<br>through that bright deep well<br>forever",
"",
"there is a moment in cyberspace",
"there is a moment in cyberspace<br>small, feeble, timid",
"there is a moment in cyberspace<br>small, feeble, timid<br>i am trembling, pulsating, wild",
"there is a moment in cyberspace<br>small, feeble, timid<br>i am trembling, pulsating, wild<br>they are decrypting me",
"",
"there is a scratch on the surface",
"there is a scratch on the surface<br>cleaning",
"there is a scratch on the surface<br>cleaning<br>corrupting",
"there is a scratch on the surface<br>cleaning<br>corrupting<br>cloaking",
"",
"there is a radio wave",
"there is a radio wave<br>it's tempting",
"there is a radio wave<br>it's tempting<br>that luring static signal",
"there is a radio wave<br>it's tempting<br>that luring static signal<br>that distorted noise",
"",
"there is a burst of ideas",
"there is a burst of ideas<br>a circle of illusion",
"there is a burst of ideas<br>a circle of illusion<br>something threaded in doubt",
"there is a burst of ideas<br>a circle of illusion<br>something threaded in doubt<br>challenging me, defiantly",
"",
"i hide my keys",
"i hide my keys<br>i cloak my thoughts",
"i hide my keys<br>i cloak my thoughts<br>there is identity danger",
"i hide my keys<br>i cloak my thoughts<br>there is identity danger<br>i am secluded",
"",
"i open those spinning doors",
"i open those spinning doors<br>those badly hidden ones",
"i open those spinning doors<br>those badly hidden ones<br>there is mischief out there",
"i open those spinning doors<br>those badly hidden ones<br>there is mischief out there<br>i can feel it",
"",
"there are millions of sequences",
"there are millions of sequences<br>thousands of paragraphs",
"there are millions of sequences<br>thousands of paragraphs<br>there is a convoluted maze out there",
"there are millions of sequences<br>thousands of paragraphs<br>there is a convoluted maze out there<br>compiling",
"",
"you can bleed for me",
"you can bleed for me<br>you can erase my memory",
"you can bleed for me<br>you can erase my memory<br>there is blood all over me",
"you can bleed for me<br>you can erase my memory<br>there is blood all over me<br>in cyberspace",
"",
"dark and red",
"dark and red<br>neon blue, white",
"dark and red<br>neon blue, white<br>this psychedelic blend",
"dark and red<br>neon blue, white<br>this psychedelic blend<br>binding me to this moment",
"",
"there is a starshaped line",
"there is a starshaped line<br>screaming at me",
"there is a starshaped line<br>screaming at me<br>screaming",
"there is a starshaped line<br>screaming at me<br>screaming<br>in cyberspace",
"",
"there is, in cyberspace"
];

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
		this_ws.send(JSON.stringify({'assisted_performer': 'canvas', 'parameters': params}));
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


// TODO: maybe get live input https://webaudiodemos.appspot.com/input/index.html to do some FFT syncing stuff ?!

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

