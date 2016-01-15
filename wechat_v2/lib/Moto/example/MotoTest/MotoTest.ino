
#include "Moto.h"

#define MOTO_CATHODE  4
#define MOTO_ANODE  5

Moto moto(MOTO_ANODE,MOTO_CATHODE);

void setup() {
  // put your setup code here, to run once:
  moto.begin();
  
}
void loop() {
  // put your main code here, to run repeatedly:
  moto.rotate(10);
  delay(500);
  moto.stop();
  delay(500);
  moto.reversal();
  delay(500);
  moto.stop();
  delay(500);
}

