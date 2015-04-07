#include "RGBLED.h"
RGBLED rgbled(A5,A4);
void setup() {
  // put your setup code here, to run once:
  rgbled.begin();
}

void loop() {
  // put your main code here, to run repeatedly:
  rgbled.setColorRGB(255,0,0);
  delay(200);
  rgbled.setColorRGB(0,255,0);
  delay(200);
  rgbled.setColorRGB(0,0,255);
  delay(200);
}
