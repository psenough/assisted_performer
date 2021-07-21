
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
		console.log(evt.data);
		let parsed = JSON.parse(evt.data);
		console.log(parsed);
		for (instance in parsed) {
			if (instance == 'points') {
				let p = parsed[instance];
				for (i in p) {
					console.log(i + ' ' + p[i]['team'] + ' ' + p[i]['points']);
					
					// aggregate team points
					let has_team = false;
					for(t in teams) {
						if (t == p[i]['team']) {
							teams[t] += p[i]['points'];
							has_team == true;
							break;
						}
					}
					if (!has_team) teams[p[i]['team']] = p[i]['points'];
										
					// update team divs
					let t_dom = document.getElementById(p[i]['team']);
					if (t_dom) {
						//t_dom.innerHTML = teams[p[i]['team']];
					} else {
						t_dom = document.createElement("div");
						t_dom.setAttribute("id", p[i]['team']);
						t_dom.style.color = p[i]['team'];
						t_dom.style.opacity = 0.5;
						let cont = document.getElementById("content");
						if (cont) cont.appendChild(t_dom);
					}
					
					// update person divs
					let p_dom = document.getElementById(i);
					if (p_dom) {
						p_dom.innerHTML = i + ' ' + p[i]['points'];
					} else {
						p_dom = document.createElement("div");
						p_dom.setAttribute("id", i);
						p_dom.innerTHML = i + ' ' + p[i]['points'];
						let team = document.getElementById(p[i]['team']);
						if (team) team.appendChild(p_dom);
					}
					
				}
				
				//TODO: reorder divs based on points
				
				//TODO: only show top n players per team (by css)
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
