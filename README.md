# Assisted Performer 

Assisted Performer is a node.js server that serves small webpages and acts as a proxy for parameter controllers.

# Installing

Install [nodejs](http://nodejs.org/)

Download the package and call `npm install` to install all dependencies.

If you want to handle MIDI parameter install [loopmidi](https://www.tobias-erichsen.de/software/loopmidi.html) aswell.

Some audio functionality requiress dependencies that need visual studio runtime distribuables installed before a successful `npm install`

Only tested on Windows.

# Architecture

Assisted Performer is a server, it configures default parametes, launches some services (like webserver) and sits listening for connections.

The audio parameters are hardcoded inside `app.js` and cannot be altered during runtime (TODO: be reconfigurable in realtime for multipart performances).

The graphical parameters are defined by connection with the canvas element. Canvas can be anything that sends the JSON configuration string. Included are examples for a web based canvas (`http://localhost/canvas/`) and a Unity client canvas.

There should only be 1 canvas connected at a time. The system responds to the last connected one only. (TODO: allow multiple canvas, gracefully handle conflicting parameter names)

The canvas configures a set of parameters for usage, their names, default, min and max values.

Pre-configured webpages are used to control these parameters. The server listens for multiple connections (typically from multiple smartphones) and assigns each device a single parameter to control.

The system can be configured to manage a voting system, multiple users selecting same parameters. (TODO: module example of voting system)

The system can also listen in to TSPS OSC connections and bind parameters to blob tracking values. (TODO: module easy to configure the binding)

There is a master webpage available to see all parameters currently available.

The system sends back the audio parameters via MIDI interface.

The system sends back the graphic parameters via websocket or POST REQUEST RESPONSE to the canvas element.
