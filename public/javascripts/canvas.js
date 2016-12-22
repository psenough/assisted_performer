
rand = function(n){
	return Math.floor(Math.random()*n);
};

window.onload = function(){init();};

var cv;
var w;
var h;
var ctx;
var halfw;
var halfh;
var params = {};
var active_part = 1;

var configs = {
	0: {
		'params': {			
			'red': { 'friendly_name': 'Black/Red Stars', 'min': 0.0, 'max': 255.0, 'step': 1.0, 'default_value': 122.0, 'value': 122.0 },
			'rotors_speed': { 'friendly_name': 'Rotors Speed', 'min': 0.0, 'max': 5.0, 'step': 0.05, 'default_value': 0.6, 'value': 0.6 },
			'white_count': { 'friendly_name': 'White Count', 'min': 1.0, 'max': 50.0, 'step': 1.0, 'default_value': 20.0, 'value': 20.0 },
			'white_size': { 'friendly_name': 'White Size', 'min': 1.0, 'max': 50.0, 'step': 1.0, 'default_value': 20.0, 'value': 20.0 }
		},
		'on': ['UPDATE_TIMERS','EFFECT_RED_STARS','EFFECT_GOLDEN_ROTORS','EFFECT_WHITE']
	},
	1: {
		'params': {
			'bg_hue': { 'friendly_name': 'Background Hue', 'min': 0.0, 'max': 360.0, 'step': 1.0, 'default_value': 122.0, 'value': 122.0 },
			'num': { 'friendly_name': 'Number', 'min': 2.0, 'max': 200.0, 'step': 2.0, 'default_value': 80.0, 'value': 80.0 }
		},
		'on': ['UPDATE_TIMERS','EFFECT_BACKGROUND','EFFECT_PINK_SPYRAL','EFFECT_TRAIL_UP']
	}
};

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
		// change params to the ones used by active part
		params = configs[active_part]['params'];
		
		// report the new parameters to the server		
		if ((this_ws != null) && (this_ws.readyState == 1)) this_ws.sendParameters();
		
		// clear all active effects
		for (fx in cv.effects) 
		{
			cv.effects[fx]['on'] = false;
		}
		
		// activate the ones listed on this part only
		if ('on' in configs[active_part]) {
			for (var j=0; j<configs[active_part]['on'].length; j++) {
				for (fx in cv.effects) {
					if (fx == configs[active_part]['on'][j]) {
						cv.effects[fx]['on'] = true;
						break;
					}
				}
			}
		}
	}
}

	
/*	
var params = {
	//'bg_hue': { 'friendly_name': 'Background Hue', 'min': 0.0, 'max': 360.0, 'step': 1.0, 'default_value': 122.0, 'value': 122.0 },
	//'rms': { 'friendly_name': 'RMS', 'min': 0.0, 'max': 1.0, 'step': 0.05, 'default_value': 0.5, 'value': 0.5 },
	//'num': { 'friendly_name': 'Number', 'min': 2.0, 'max': 200.0, 'step': 2.0, 'default_value': 80.0, 'value': 80.0 },
	'red': { 'friendly_name': 'Black/Red Stars', 'min': 0.0, 'max': 255.0, 'step': 1.0, 'default_value': 122.0, 'value': 122.0 },
	'rotors_speed': { 'friendly_name': 'Rotors Speed', 'min': 0.0, 'max': 5.0, 'step': 0.05, 'default_value': 0.6, 'value': 0.6 },
	'white_count': { 'friendly_name': 'White Count', 'min': 1.0, 'max': 50.0, 'step': 1.0, 'default_value': 20.0, 'value': 20.0 },
	'white_size': { 'friendly_name': 'White Size', 'min': 1.0, 'max': 50.0, 'step': 1.0, 'default_value': 20.0, 'value': 20.0 }
};*/

//TODO: multiple params, multiple parts

function drawShape(centerX, centerY, rotAngle, scaleX, scaleY, posX, posY, angle, size, height) {
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
	//ctx.closePath();
}
	
let drawCanvas = function() {
	resize();

	/*var num = params['num']['value']||0;
	var rms = params['rms']['value']||0;
	var red = params['red']['value']||0;
	var white_count = params['white_count']['value']||0;
	var white_size = params['white_size']['value']||0;*/
	
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
				cos5 = Math.cos((n2-n)/2000);
				
				/*rms = params['rms']['value'];
				num = parseInt(params['num']['value'],10);
				red = parseInt(params['red']['value'],10);
				white_count = parseInt(params['white_count']['value'],10);
				white_size = parseInt(params['white_size']['value'],10);*/
				
				tradius = w*20;
			}
		},
		'EFFECT_BACKGROUND': {
			'on': false,
			'call': function() {
						var hsl = ctx.fillStyle = "hsl("+params['bg_hue']['value']+","+ parseInt(18+cos5*3,10) +"%,"+ parseInt(18+cos1*2+sin1,10) +"%)";
						
						//ctx.fillRect(0,0,w,h);
						//ctx.clearRect(0,0,w,h);
						
						var rx = w/Math.sqrt(2);
						var ry = h/Math.sqrt(2);
						var cx = w/2;
						var cy = h/2;
						
						var scaleX;
						var scaleY;
						var invScaleX;
						var invScaleY;
						var grad;
						
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
						grad.addColorStop(0,"#000");
						grad.addColorStop(1,hsl);
						
						ctx.save();
						ctx.setTransform(scaleX,0,0,scaleY,0,0);
						ctx.fillRect(0,0,w*invScaleX,h*invScaleY);
						ctx.restore();
					}
		},
		'EFFECT_RED_STARS': {
			'on': true,
			'call': function() {
						let num = ('num' in params)?params['num']['value']:80;
						let rms = ('rms' in params)?params['rms']['value']:0.5;
						let red = ('red' in params)?params['red']['value']:122;
						var sizex = w/num;
						var sizexhalf = parseInt((w/num)*0.5,10);
						var sizey = parseInt(10*(w/h),10);
						
						ctx.lineWidth = Math.ceil(sizexhalf*0.5 + rms*sizexhalf,10);
						var r1 = parseInt(red,10);
						if (r1 > 255) r1 = 255;
						if (r1 < 0) r1 = 0;
						ctx.fillStyle = "rgba("+r1+",0,0,1.0)";
						
						for(var i=1; i<num; i++) {

							var ydrift = i*cos2 + sin3*((num-i)*i)*20 + (i+10)*sin1/(cos3+500);
							
							var posx = parseInt(i*sizex,10);
							var posy = parseInt((w*0.25+ydrift)%w,10);
							roundRect(ctx, posx, posy, sizexhalf, sizey, 5, true, false);
							
							//var posx = parseInt(i*sizex,10);
							posy = parseInt((w*0.5+ydrift)%w,10);
							roundRect(ctx, posx, posy, sizexhalf, sizey, 3+20*sin2, true, false);
							
							posy = parseInt((w*0.75+ydrift)%w,10);
							roundRect(ctx, posx, posy, sizexhalf, sizey, 10*sin1, true, false);
							
							posy = parseInt((w+ydrift)%w,10);
							roundRect(ctx, posx, posy, sizexhalf, sizey, 10*cos3, true, false);
							
							
							
						}
					}					
		},
		'EFFECT_CENTER_ARCS': {
			'on': false,
			'call': function() {
						var calc = [];
						let num = ('num' in params)?params['num']['value']:80;
						var anum = num*0.5;
						for(var i=0; i<anum; i++) {
							
							ctx.lineWidth = Math.max(1,(i%6)*2+i*sin1*0.025+cos2*2+2*sin2 -2);
							//ctx.strokeStyle = "rgba("+red+","+parseInt(((num-i)/num)*255,10)+",10,0.1)";
							ctx.strokeStyle = "hsl("+parseInt(((seedrand*sin2*2+(i/anum)*360*cos1*0.25+sin2*i+n2*0.5)%360)*0.5 + 80*sin2,10)+","+parseInt((anum-i/anum)*100,10)+"%,15%)";
						
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
			'call': function() {
						let num = ('num' in params)?params['num']['value']:80;
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
		'EFFECT_RANDOM_LINES': {
			'on': false,
			'call': function() {
						let num = ('num' in params)?params['num']['value']:80;
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
						
						ctx.lineCap = 'round';
						ctx.lineWidth = Math.max(1,(i%6)*2+i*sin1*0.025+cos2*2+2*sin2);
						ctx.strokeStyle = "rgba(0,0,0,0.25)";
						

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
		'EFFECT_GOLDEN_ROTORS': {
			'on': true,
			'call': function() {

						var parts = 3;
						var flip = Math.sin(sin1*cos1*cos3);
						let rotors_speed = ('rotors_speed' in params)?params['rotors_speed']['value']:0.6;
						let num = ('num' in params)?params['num']['value']:80;
						
						ctx.lineWidth = 2;
						ctx.strokeStyle = "rgba(200,200,5,0.4)";
						ctx.save();
						ctx.translate(w*(1.0+cos3*0.5)*.5,h*.5);
						ctx.rotate((n2-n)*0.01*rotors_speed);
						for (var k=0; k < parts; k++) {
							for(var i=0; i<num*0.5; i++) {
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
						ctx.rotate(-(n2-n)*0.01*rotors_speed);
						for (var k=0; k < parts; k++) {
							for(var i=0; i<num*0.5; i++) {
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
		'EFFECT_WHITE': {
			'on': true,
			'call': function() {
						let size = ('white_size' in params)?params['white_size']['value']:20;
						let maxj = ('white_count' in params)?params['white_count']['value']:20;;

						var d = new Date();
						var timer = d.getTime();
						
						var angle = 0.0; //(Math.PI*2)/num;

						var opening, phase1, phase2;
						
						phase1 = timer/25000;
						phase2 = timer/2500;
						
						var seedindex = rand(3928896423);
						var clip = false;
						var centerX = w*0.5;
						var centerY = h*0.5;
						var oangle = Math.asin( centerX / Math.sqrt(centerX*centerX+centerY*centerY) ) * 2;
						
						var diagonal = 105 + sin3;
		
						for (var j=0; j<maxj; j++) {
						
							var thisb = parseInt(Math.sin(phase2*0.5 + j)*35+120, 10);
							color = "rgba(255,255,255,"+(0.12*((maxj-j)/maxj))+")";
							ctx.fillStyle = color;
							var i = seedindex;
							opening = j*30 + sin3*20 + sin1*10 ;
							
							ctx.save();
							
							// clip top-left
							if (clip) {
								//ctx.fillStyle = "rgba(0,0,0,1.0)";
								ctx.beginPath();
								ctx.moveTo(0,0);
								ctx.lineTo(centerX,0);
								ctx.lineTo(centerX,centerY);
								//ctx.lineTo(0,0);
								//ctx.fill();
								ctx.clip();
								ctx.closePath();
							}
						
							drawShape( 	centerX, centerY, 0,
										1.0, 1.0,
										Math.sin(i*angle+phase1)*opening - diagonal, Math.cos(i*angle+phase1)*opening - diagonal,
										i*angle+Math.sin(phase2+Math.sin(i*angle)+j*0.5)*3,
										size*.5*j,
										size);
							
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
										size);
							
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
										size);
							
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
										size);
							
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
										size);
							
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
										size);
							
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
										size);
							
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
										size);
							
							ctx.restore();
						
						
						
						
						/*
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
						}*/
					}
			}
		},
		'EFFECT_TRAIL_UP': {
			'on': true,
			'call': function() {

						ctx.lineWidth = 10;
						var num_heads = 40;
						var num_lines = 40;
						//var flip = Math.sin(sin1*cos1*cos3);
						//let rotors_speed = ('rotors_speed' in params)?params['rotors_speed']['value']:0.6;
						//let num = ('num' in params)?params['num']['value']:80;
						for (var i=0; i<num_heads; i++) {
							ctx.save();
							//console.log(i + ' ' + num_heads);
							ctx.translate(w*.5 + Math.sin(i + cos3)*w*.5, - Math.sin(i + cos2 + sin2*cos1)*20 + Math.sin(i*sin2)*50);
							
							ctx.strokeStyle = "rgba(120,0,0,1.0)";
							ctx.beginPath();
							ctx.moveTo(0,0);
							for (var j=1; j<num_lines; j++) {
								ctx.lineTo(Math.sin(j + cos2*30 + sin1*20)*10, j*(h/(num_lines)));
							}
							ctx.stroke();
							//ctx.closePath();
							
							/*ctx.fillStyle = "rgba(120,120,0,0.5)";
							ctx.moveTo(0,0);
							ctx.beginPath();
							ctx.arc(0, 0, 20, 0, 2 * Math.PI);
							ctx.fill();
							ctx.closePath();
							*/
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
	
	var ip = document.getElementById("ip"); 
	if (!ip) {
		ip = document.createElement('div');
		ip.setAttribute('id','ip');
		document.body.appendChild(ip);
		ip.innerHTML = 'http://192.168.1.28:8090';
	}
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
		this_ws.sendParameters();
	};
	
	this_ws.sendParameters = function() {
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
		case 37: // left arrow
			effect--;
			if (effect < 0) effect = 5;
		break;
		case 48: // 0
			cv.effects['EFFECT_BACKGROUND']['on'] = !cv.effects['EFFECT_BACKGROUND']['on'];
		break;
		case 49: // 1
			cv.effects['EFFECT_RED_STARS']['on'] = !cv.effects['EFFECT_RED_STARS']['on'];
		break;
		case 50: // 2
			cv.effects['EFFECT_CENTER_ARCS']['on'] = !cv.effects['EFFECT_CENTER_ARCS']['on'];
		break;
		case 51: // 3
			cv.effects['EFFECT_PINK_SPYRAL']['on'] = !cv.effects['EFFECT_PINK_SPYRAL']['on'];
		break;
		case 52: // 4
			cv.effects['EFFECT_RANDOM_LINES']['on'] = !cv.effects['EFFECT_RANDOM_LINES']['on'];
		break;
		case 53: // 5
			cv.effects['EFFECT_GOLDEN_ROTORS']['on'] = !cv.effects['EFFECT_GOLDEN_ROTORS']['on'];
		break;
		case 54: // 6
			cv.effects['EFFECT_WHITE']['on'] = !cv.effects['EFFECT_WHITE']['on'];
		break;
		case 72: // h
			//TODO: hide text with ip adress
			var ip = document.getElementById("ip"); 
			if (ip) {
				if ((ip.className) == '') ip.className = 'hidden';
				 else ip.className = '';
			}
		break;
	}
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