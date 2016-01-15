#include "Moto.h"
#include "Arduino.h"

Moto::Moto(int anodePin,int cathodePin){
  _anodePin = anodePin;
  _cathodePin = cathodePin;
}
void Moto::begin(void){
  pinMode(_anodePin,OUTPUT);
  pinMode(_cathodePin,OUTPUT);
  _state = STOP;
}
void Moto::rotate(int power){
  if(_state!=ROTATE)
  {
    _state = ROTATE;
    _power = power;
    digitalWrite(_cathodePin,LOW);
    analogWrite(_anodePin,power); 
  }
}
void Moto::reversal(void){
  if(_state != REVERSAL)
  {
    _state = REVERSAL;
    digitalWrite(_cathodePin,HIGH);
    digitalWrite(_anodePin,LOW);
  }
}
void Moto::stop(void){
  if(_state != STOP)
  {
    _state = STOP;
    digitalWrite(_anodePin,LOW);
    digitalWrite(_cathodePin,LOW);
  }
}
void Moto::speedup(void){
  if(_state ==ROTATE)
  {
    _power +=SPEEPUP_STEP;
    if(_power >=255)
      _power =255;
    analogWrite(_anodePin,_power);
  }
}

void Moto::speedown(void){
  if(_state ==ROTATE)
  {
    _power -= SPEEPUP_STEP;
    if(_power<=10)
      _power = 10;
    analogWrite(_anodePin,_power);
  }
}
