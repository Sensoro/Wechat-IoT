#ifndef RGB_LED_H
#define RGB_LED_H

#include "Arduino.h"
#include "stdint.h"

class RGB_Led
{
public:
    RGB_Led(int data_pin);
    
    void begin(void);
    void setColorRGB(uint8_t red, uint8_t green, uint8_t blue);
    void setColorHSB(float hue, float saturation, float brightness);

private:
    int _data_pin;
};

#endif
