function moveFocus( ox, oy, dx, dy )
{
  var x = ox;
  var y = oy;
  while( true )
  {
    x += dx;
    y += dy;
    if (x < 0 || x > 14 || y < 0 || y > 16)
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
    if (x < 0 || x > 14 || y < 0 || y > 16)
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