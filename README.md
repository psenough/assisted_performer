# Assisted Performer - Twitch Crosswords version

Assisted Performer is a node.js server that serves small webpages and acts as a proxy for parameter controllers. Bridging MIDI, OSC, websockets, HTTP requests, etc between applications.

## Installing

Tested in Windows 10 and MacOS 10.13

Install [nodejs](http://nodejs.org/)

Clone the repo and call `npm install` to install all dependencies.

## Running 

Just call `npm start` or `node app.js`

If you use `launch_server.bat` make sure you edit the path.

On Google Chrome change `chrome://flags/#autoplay-policy` to not require user interaction

Load `http://localhost/crosswords` to display main crosswords screen `F11` to fullscreen

Load `http://localhost/hints` to display the hints screen

Load `http://localhost/points` to display the points screen

## Debug Keys

On the nodejs command line box

`a` lists active connections

## TODO

- twitch bot !team, keep track of usernames teams and points (send points info to connected points.html via ws)

- twitch bot !guess, reply, resend points to points.html, send info to crosswords.html, send info to hints.html to cross it out from list)
