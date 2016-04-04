
var zonebase = 120;
var client_state = 0;
var game_state = 0;

var display_post_lag = true;

navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;

function thisthing() {
	request_ping();
	setInterval(recheck_ping, max_timeout);
}

var rotation_canvas_animation = false;

/// step 1 - create off-screen canvas
var oc   = document.createElement('canvas'),
octx = oc.getContext('2d');
var oc2   = document.createElement('canvas'),
octx2 = oc2.getContext('2d');

function animate_rotation(ctx,w,h) {
	
	ctx.clearRect(0,0,w,h);

	var img = [];
	for (var j=0; j<6; j++) {
		img[j] = new Image();
		img[j].src = '../images/2_'+j+'.png';
	}

	function drawThis() {
		
		ctx.clearRect(0,0,w,h);
	
		var d2 = new Date();
		var n2 = d2.getTime();

		var sorted = [];

		for (var i=0; i<img.length; i++) {
			var sin1 = Math.sin((n2-n)/1000 + i*1.05)+1.0;
			var sin2 = Math.sin((n2-n)/1000 + (i+1.5)*1.05)+1.0;
			var thish = parseInt(h*.75,10);
			var prevx = img[i].posx;
			img[i].posx = parseInt(h*0.3 + sin1*0.5*(w-thish - h*0.2*2),10);
			img[i].posy = 0;
			img[i].widthx = parseInt((sin2+2.0)*(thish*0.25),10);
			img[i].widthy = parseInt((sin2+2.0)*(thish*0.25),10);

			if (sorted.length == 0) {
				sorted.push(i);
			} else {
				var inserted = false;
				for (var m=0; m<sorted.length; m++) {
					if (img[sorted[m]].widthx < img[i].widthx) {
						sorted.splice(m,0,i);
						inserted = true;
						break;
					}
				}
				if (!inserted) sorted.push(i);
			}
		}
		
		for(var k=sorted.length-1; k>-1; k--) {
			var ref = img[sorted[k]];
			
			if (ref.widthx < ref.width*0.5) {
				oc.width  = ref.width*0.5;
				oc.height = ref.width*0.5;
				octx.drawImage(ref, 0, 0, oc.width, oc.height);
				if (ref.widthx < ref.width*0.35) {
					oc2.width  = ref.width*0.35;
					oc2.height = ref.width*0.35;
					octx2.drawImage(oc, 0, 0, oc2.width, oc2.height);
					ctx.drawImage(oc2, ref.posx, ref.posy, ref.widthx, ref.widthy);
				} else {
					ctx.drawImage(oc, ref.posx, ref.posy, ref.widthx, ref.widthy);
				}
			} else {
				ctx.drawImage(ref, ref.posx, ref.posy, ref.widthx, ref.widthy);
			}
		}

	}
	
	requestAnimationFrame( animate );

	var d = new Date();
	var n = d.getTime();

	function animate() {
		if (rotation_canvas_animation == true) {
			requestAnimationFrame( animate );
			drawThis();
		}
	}
}

var shield_half_height = 0;
var shield_start = 0;
var shield_start_x = 0;

function calculate_buttons_position() {
	//console.log('calculating positions');
	var ratio = window.innerWidth / window.innerHeight; // 1080 x 1920
	var gfxratio = 375/627;//1080/1920;
	var usedHeight = 0;
	var usedWidth = 0;
	if (ratio > gfxratio) {
		//console.log('height touching the sides');
		var usedheight = window.innerHeight;
		var usedwidth = parseInt(usedheight * gfxratio, 10);
	} else {
		//console.log('width touching the sides');
		var usedwidth = window.innerWidth;
		var usedheight = parseInt(usedwidth / gfxratio, 10);
	}

	// background image
	var background = document.getElementById('background');
	if (background) {
		
		background.style.left = parseInt(window.innerWidth*0.5 - usedwidth*0.5,10) + 'px';
		//background.style.top = parseInt(0,10) + 'px';

		background.style.width = parseInt(usedwidth,10) + 'px';
		background.style.height = parseInt(usedheight,10) + 'px';		
	} else {
		background = document.createElement('div');
		background.setAttribute('id','background');
		background.setAttribute('class','background');
		document.body.appendChild(background);
	}
	
	var index = 0;
	for (param in params) {
		
		var add = document.getElementById('p' + param + 'add');
		if (add) {
			add.style.left = parseInt(window.innerWidth*0.5 - usedwidth*0.5,10) + 'px';
			add.style.top = parseInt(usedheight*0.25,10) + 'px';

			add.style.width = parseInt(usedwidth*0.5,10) + 'px';
			add.style.height = parseInt(usedheight*0.5,10) + 'px';
			
			switch (client_state) {
				case 4:
					if (team == 1) add.setAttribute('class','btn tap_off');
						else add.setAttribute('class','hidden');
				break;
				default:
					add.setAttribute('class','hidden');
				break;
			}
		} else {
			add = document.createElement('div');
			add.setAttribute('id', 'p' + param + 'add');
			add.setAttribute('class', 'add');
			document.body.appendChild(add);
			//TODO: add action listener for add, affect within range and send vote to server
		}

		//TODO: add value
		
		//TODO: add minus
		
		//TODO: add subtitle
		
		index++;
	}
	
	// rotation canvas
	
	var rotation_canvas = document.getElementById('rotation_canvas');
	if (rotation_canvas) {
		rotation_canvas.style.left = parseInt(window.innerWidth*0.5 - usedwidth*0.5,10) + 'px';
		rotation_canvas.style.top = parseInt(usedheight*0.58,10) + 'px';

		var w = parseInt(usedwidth*1.0,10);
		var h = parseInt(usedheight*0.2,10);
		rotation_canvas.style.width = w + 'px';
		rotation_canvas.style.height = h + 'px';
		rotation_canvas.setAttribute('width', rotation_canvas.style.width);
		rotation_canvas.setAttribute('height', rotation_canvas.style.height);
		
		switch (client_state) {
			case 2:
				rotation_canvas.setAttribute('class','asset rotation_canvas');
				rotation_canvas_animation = true;
				ctx = rotation_canvas.getContext("2d");
				ctx.width = w;
				ctx.height = h;
				animate_rotation(ctx,w,h);
			break;
			default:
				rotation_canvas_animation = false;
				rotation_canvas.setAttribute('class','hidden');
			break;
		}
	}
	
	var bw_fire_left = document.getElementById('bw_fire_left');
	if (bw_fire_left) {
		bw_fire_left.style.left = parseInt(window.innerWidth*0.5 - usedwidth*0.375,10) + 'px';
		bw_fire_left.style.top = parseInt(usedheight*0.7,10) + 'px';

		bw_fire_left.style.width = parseInt(usedwidth*0.25,10) + 'px';
		bw_fire_left.style.height = parseInt(usedheight*0.25,10) + 'px';
		
		switch (client_state) {
			case 4:
				if (team == 1) bw_fire_left.setAttribute('class','btn tap_off');
					else bw_fire_left.setAttribute('class','hidden');
			break;
			default:
				bw_fire_left.setAttribute('class','hidden');
			break;
		}
	}

	var shield = document.getElementById('shield');
	if (shield) {
		shield_start_x = parseInt(window.innerWidth*0.5 - usedwidth*0.35,10);
		shield.style.left = shield_start_x + 'px';
		shield_start = parseInt(usedheight*0.58,10);
		shield.style.top = shield_start + 'px';

		shield_half_height = parseInt(usedwidth*0.2,10);
		shield.style.width = shield_half_height*2 + 'px';
		shield.style.height = shield_half_height*2 + 'px';
		
		switch (client_state) {
			case 4:
				if (team == 5) shield.setAttribute('class','asset shield');
					else shield.setAttribute('class','hidden');
			break;
			default:
				shield.setAttribute('class','hidden');
			break;
		}
	}
	
}

window.onload = function(){init();};

window.onresize = function(){
	calculate_buttons_position();
}

function sendvote(votetype, pvote) {
	var zone = votetype; //zonebase + (team * nzones) + votetype;
	var http = new XMLHttpRequest();
	var url = "/vote";
	var params = "vote=fire";
	if (pvote !== undefined) params += "&pvote="+pvote;
	params +=  "&zone="+zone;
	console.log(params);
	http.open("POST", url, true);
	http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	http.onreadystatechange = function() {
		if(http.readyState == 4 && http.status == 200) {
			console.log(http.responseText);
			//var headers = http.getAllResponseHeaders();
			//console.log(headers);
		}
	}
	http.send(params);
}

var max_timeout = 1000;
var d = new Date();
var n = d.getTime();

function recheck_ping() {
	var d2 = new Date();
	var n2 = d2.getTime();
	if ((n2-n) > max_timeout) {
		request_ping();
	}
}

var gamedata = null;
var pingout;
var pingin;
var lastpingtime = 0;

function request_ping() {
	var http = new XMLHttpRequest();
	var url = "/ping";
	var params = 'lastpingtime='+lastpingtime;
	http.open("POST", url, true);
	http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	http.onreadystatechange = function() {
		if(http.readyState == 4 && http.status == 200) {
			if (http.responseText) {
				
				pingin = (new Date()).getTime();
				lastpingtime = (pingin-pingout);
				if (display_post_lag) {
					var lag = document.getElementById('lag');
					if (lag) lag.innerHTML = (pingin-pingout) + 'ms';
				}

				var headers = parseResponseHeaders(http.getAllResponseHeaders());
				if ('Assisted-Performer' in headers) {
					console.log(headers['Assisted-Performer']);
					params = JSON.parse(headers['Assisted-Performer']);
					calculate_buttons_position();
				}
			}
		}
	}
	http.send(params);
	
	var d2 = new Date();
	pingout = d2.getTime();
}

var params = {};

function parseResponseHeaders(headerStr) {
  var headers = {};
  if (!headerStr) {
    return headers;
  }
  var headerPairs = headerStr.split('\u000d\u000a');
  for (var i = 0, len = headerPairs.length; i < len; i++) {
    var headerPair = headerPairs[i];
    var index = headerPair.indexOf('\u003a\u0020');
    if (index > 0) {
      var key = headerPair.substring(0, index);
      var val = headerPair.substring(index + 2);
      headers[key] = val;
    }
  }
  return headers;
}

document.addEventListener("keydown", keyDownTextField, false);

function keyDownTextField(e) {
var keyCode = e.keyCode;
console.log(keyCode);
	switch(keyCode) {
		case 49: //1
			team = 0;
			calculate_buttons_position();
		break;
		case 50: //2
			team = 1;
			calculate_buttons_position();
		break;
		case 51: //3
			team = 2;
			calculate_buttons_position();
		break;
		case 52: //4
			team = 3;
			calculate_buttons_position();
		break;
		case 53: //5
			team = 4;
			calculate_buttons_position();
		break;
		case 54: //6
			team = 5;
			calculate_buttons_position();
		break;
		
		case 48: //0
			client_state = 5;
			calculate_buttons_position();
		break;
	}
}
