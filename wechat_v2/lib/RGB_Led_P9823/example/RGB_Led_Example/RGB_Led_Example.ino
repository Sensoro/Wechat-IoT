#include <RGB_Led.h>

#include "RGB_Led.h"

#define RGB_LED_DPIN  10

RGB_Led   rgb_led(10);
unsigned long previousMillis = 0;

static float hue = 0.0;
static bool up = true;

void setup() {
  rgb_led.begin();
  //rgb_led.setColorRGB(255, 0, 0);
}

void loop() {  
  rgb_led.setColorHSB(hue,1,0.1);
  if (up)
    hue+= 0.025;
  else
    hue-= 0.025;
  if (hue>=1.0 && up)
    up = false;
  else if (hue<=0.0 && !up)
    up = true;
  delay(200);
}
