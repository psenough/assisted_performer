#include <Event.h>
#include <Timer.h>

// https://github.com/JChristensen/Timer/archive/v2.1.zip
Timer t;

// digital pin 2 has a pushbutton attached to it. Give it a name:
int pushButton = 2;
int ledPin = 13;

// the setup routine runs once when you press reset:
void setup() {
  // initialize serial communication at 9600 bits per second:
  Serial.begin(9600);
  // make the pushbutton's pin an input:
  //pinMode(pushButton, INPUT);
  pinMode(pushButton, INPUT_PULLUP);
  
  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, HIGH);
  
  t.oscillate(ledPin, 500, LOW);
  //t.every(1000, takeReading);
}

// the loop routine runs over and over again forever:
void loop() {
  // read the input pin:
  int buttonState = digitalRead(pushButton);
  // print out the state of the button:
  Serial.println(buttonState);
  delay(1);        // delay in between reads for stability
  t.update();
}
