
window.onload = function(){ init(); };

function init() {
	try {
		connectWebSockets();
	} catch(e) {
		console.log(e);
	}
}

let teams = {};

let params = {};
let this_websockets = 'ws://'+location.host.split(':')[0]+':8080';
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
		let obj = {'assisted_performer': 'points', 'parameters': params};
		this_ws.send(JSON.stringify(obj));
	};

	this_ws.onmessage = function(evt) {
		//console.log(evt.data);
		let parsed = JSON.parse(evt.data);
		console.log(parsed);
		for (instance in parsed) {
			if (instance == 'points') {
				let p = parsed[instance];
				for (i in p) {
					//console.log(i + ' ' + p[i]['team'] + ' ' + p[i]['points']);
					
					// aggregate team points
					let has_team = false;
					for(t in teams) {
						if (t == p[i]['team']) {
							//console.log(t + ' with ' + teams[t] + ' adding points ' + p[i]['points']);
							teams[t] += p[i]['points'];
							has_team = true;
							break;
						}
					}
					if (!has_team) {
						teams[p[i]['team']] = p[i]['points'];
						//console.log('no team for ' + i);
					}
										
					// update team divs
					let t_dom = document.getElementById(p[i]['team']);
					if (t_dom) {
						t_dom.setAttribute("data-val", teams[p[i]['team']]);
						//console.log(teams);
						//t_dom.setAttribute("data-val", 42);
					} else {
						t_dom = document.createElement("div");
						t_dom.setAttribute("id", p[i]['team']);
						t_dom.setAttribute("data-val", teams[p[i]['team']]);
						t_dom.classList.add('team');
						t_dom.style.backgroundColor = p[i]['team'];
						let cont = document.getElementById("content");
						if (cont) cont.appendChild(t_dom);
					}
					
					// update person divs
					let charlimit = 10;
					let pstring = i.substring(0,charlimit) + ' ' + parseInt(p[i]['points'],10);
					let p_dom = document.getElementById(i);
					if (p_dom) {
						p_dom.innerHTML = pstring;
						p_dom.setAttribute("data-val", parseInt(p[i]['points'],10));
					} else {
						p_dom = document.createElement("div");
						p_dom.setAttribute("id", i);
						p_dom.setAttribute("data-val", parseInt(p[i]['points'],10));
						p_dom.innerHTML = pstring;
						p_dom.classList.add('row');
						let team = document.getElementById(p[i]['team']);
						if (team) team.appendChild(p_dom);
					}
					
				}
				
				// reorder team divs based on points
				var classname = document.getElementsByClassName('team');
				var divs = [];
				for (var i = 0; i < classname.length; ++i) {
					divs.push(classname[i]);
				}
				divs.sort(function(a, b) {
					return parseInt(b.dataset.val,10) - parseInt(a.dataset.val,10);
				});
				divs.forEach(function(el) {
					let parent = el.parentElement;
					let temp = el;
					el.parentElement.removeChild(el);
					parent.appendChild(temp);
				});
				
				// reorder people divs based on points
				var classnamer = document.getElementsByClassName('row');
				var divsr = [];
				for (var i = 0; i < classnamer.length; ++i) {
					divsr.push(classnamer[i]);
				}
				divsr.sort(function(a, b) {
					return parseInt(b.dataset.val,10) - parseInt(a.dataset.val,10);
				});
				divsr.forEach(function(el) {
					let parent = el.parentElement;
					let temp = el;
					el.parentElement.removeChild(el);
					parent.appendChild(temp);
				});
				
			}
		}
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
