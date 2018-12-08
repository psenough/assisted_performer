//#include <Event.h>
//#include <Timer.h>

// https://github.com/JChristensen/Timer/archive/v2.1.zip
//Timer t;

// digital pin 2 has a pushbutton attached to it. Give it a name:
int pushButton = 2;
int ledPin = 13;

unsigned long lastDebounceTime;
unsigned long debounceTime = 10;
int prevButtonState = 0;

unsigned long lastBlink;
unsigned long blinkRate = 1000;
bool blinkState;

// the setup routine runs once when you press reset:
void setup() {
  // initialize serial communication at 9600 bits per second:
  Serial.begin(9600);
  // make the pushbutton's pin an input:
  //pinMode(pushButton, INPUT);
  pinMode(pushButton, INPUT_PULLUP);

  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);

  //t.oscillate(ledPin, 500, LOW);
  //t.every(1000, takeReading);

  lastDebounceTime = 0;
  lastBlink = 0;
  blinkState = true;
}

// the loop routine runs over and over again forever:
void loop() {
  unsigned long curr = millis();
  
  // read the input pin:
  int buttonState = digitalRead(pushButton);

  if (curr > lastDebounceTime) {
    if (buttonState != prevButtonState) {
      Serial.println(buttonState);
      prevButtonState = buttonState;
    }
    lastDebounceTime = curr;
  }
  //Serial.println(buttonState);
 
  if (curr > lastBlink + blinkRate) {
    if (blinkState == true) {
      digitalWrite(ledPin, LOW);
      blinkState = false;
      //Serial.println("off");
    } else {
      digitalWrite(ledPin, HIGH);
      blinkState = true;
      //Serial.println("on");
    }
    lastBlink = curr;
  }
  
  delay(1); // delay in between reads for stability
}
