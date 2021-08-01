function moveFocus( ox, oy, dx, dy )
{
  var x = ox;
  var y = oy;
  while( true )
  {
    x += dx;
    y += dy;
    if (x < 0 || x > 15 || y < 0 || y > 15)
    {
      return;
    }
    
    var box = document.querySelector("div[data-x='"+x+"'][data-y='"+y+"'] input");
    if (box)
    {
      box.focus();
      return;
    }
  }
}
function findHintNum( ox, oy, dir )
{
  if (dir == 'across')
  {
    dx = -1;
    dy = 0;
  }
  if (dir == 'down')
  {
    dx = 0;
    dy = -1;
  }
  var x = ox;
  var y = oy;
  while( true )
  {
    if (x < 0 || x > 15 || y < 0 || y > 15)
    {
      return - 1;
    }
    
    var number = document.querySelector("div[data-x='"+x+"'][data-y='"+y+"'][data-hint]");
    if (number)
    {
      var hint = parseInt( number.getAttribute("data-hint") );
      if (document.querySelector(".hints tr[data-hint='"+hint+"'][data-hintdir='"+dir+"']"))
      {
        return hint;
      }
    }

    x += dx;
    y += dy;
  }
}

document.addEventListener('DOMContentLoaded', function(event)
{
  var inputs = document.querySelectorAll("#grid input");
  inputs.forEach(function(element){
    element.onfocus = function(event)
    {
      var x = parseInt( event.currentTarget.parentNode.getAttribute("data-x") );
      var y = parseInt( event.currentTarget.parentNode.getAttribute("data-y") );

      var hints = document.querySelectorAll(".hints tr[data-hint]");
      hints.forEach(function(element){ element.classList.remove("highlight"); });

      var hint = findHintNum(x,y,'down');
      if (hint != -1)
      {
        hints = document.querySelectorAll(".hints tr[data-hint='"+hint+"'][data-hintdir='down']");
        hints.forEach(function(element){ element.classList.add("highlight"); });
      }
      hint = findHintNum(x,y,'across');
      if (hint != -1)
      {
        hints = document.querySelectorAll(".hints tr[data-hint='"+hint+"'][data-hintdir='across']");
        hints.forEach(function(element){ element.classList.add("highlight"); });
      }

    };  
    element.onkeyup = function(event)
    {
      var x = parseInt( event.currentTarget.parentNode.getAttribute("data-x") );
      var y = parseInt( event.currentTarget.parentNode.getAttribute("data-y") );
      if (event.key == "ArrowUp")
      {
        moveFocus(x,y,0,-1);
      }
      if (event.key == "ArrowDown")
      {
        moveFocus(x,y,0,1);
      }
      if (event.key == "ArrowLeft")
      {
        moveFocus(x,y,-1,0);
      }
      if (event.key == "ArrowRight")
      {
        moveFocus(x,y,1,0);
      }
      if (event.key == "Delete")
      {
        event.currentTarget.value = "";
      }
    };
  });
});

window.onload = function(){ init(); };

function init() {
	try {
		connectWebSockets();
	} catch(e) {
		console.log(e);
	}
}

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
		let obj = {'assisted_performer': 'crosswords', 'parameters': params};
		this_ws.send(JSON.stringify(obj));
	};

	this_ws.onmessage = function(evt) {
		let parsed = JSON.parse(evt.data);
		console.log(parsed);
		if (parsed.pos)
		{
			let x = parsed.x - 1;
			let y = parsed.y - 1;
			let counter = 0;
			let dx = 0;
			let dy = 0;
			if (parsed.pos[0] == 'H') {dx = 1;} else {dx = 0;}
			if (parsed.pos[0] == 'V') {dy = 1;} else {dy = 0;}
		
			for (letter in parsed.word) {
				//console.log(parsed.pos + ' ' + parsed.word);			
				document.querySelector("div[data-x='"+(x+dx*counter)+"'][data-y='"+(y+dy*counter)+"'] input").value = parsed.word[letter];
				counter++;
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
