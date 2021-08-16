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

`s` saves current state to temp file

`l` loads current state from temp file

## TODO

- #DC5 and #dc5 point missmatch on what twitch says and points.html???

- points.html not reordering teams

- alternative !a and !d to across and down instead of just v h

- W letter gets eaten by small input

- round float points on twitch text

