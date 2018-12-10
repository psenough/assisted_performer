# Assisted Performer - Residencia Expand 2018 version

Assisted Performer is a node.js server that serves small webpages and acts as a proxy for parameter controllers. Bridging MIDI, OSC, websockets, HTTP requests, etc between applications.

## Installing

Tested in Windows 10 and MacOS 10.13

Install [nodejs](http://nodejs.org/)

Clone the repo and call `npm install` to install all dependencies.

## Arduino Support

Flash your Arduino Uno with the `arduino_example/arduino_example.ino`

Pins 2 and ground read from the clicker. Pins 13 and ground blink the LED.

If you want to handle serialport communication call `npm install -g serialport` to install serialport globally (also installs some useful command-line tools)

`serialport-list` will list you all the devices you have (you'll need it to know the name of the active port you want to interface with)

Use that command to figure out what port you want to use and change app.js (line 670) accordingly

## Developer Notes

`node list-dir-of-images-for-html.js >> temp.txt` lists all images from `public/images` subfolders in a .jade friendly format to copy paste and include in canvas.jade

## Running 

Just call `npm start` or `node app.js`

If you use `launch_server.bat` make sure you edit the path.

On Google Chrome change `chrome://flags/#autoplay-policy` to not require user interaction

Load `http://localhost/canvas` to display main screen `F11` to fullscreen

## Debug Keys

On the nodejs command line box

`a` lists active connections

`c` changes season

`p` lists parameters

`r` reassigns parameters
