/*
 * Copyright (C) 2012 Paulo Marques (pjp.marques@gmail.com)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of 
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all 
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN 
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/* Information about the P9813 protocol obtained from:
 * http://www.seeedstudio.com/wiki/index.php?title=Twig_-_Chainable_RGB_LED
 *
 * HSB to RGB routine adapted from:
 * http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
 */


// --------------------------------------------------------------------------------------

#include "RGBLED.h"

// Forward declaration
float hue2rgb(float p, float q, float t);

// --------------------------------------------------------------------------------------

RGBLED::RGBLED(byte clk_pin, byte data_pin) :
    _clk_pin(clk_pin), _data_pin(data_pin)
{
}

// --------------------------------------------------------------------------------------

void RGBLED::begin(void)
{
    pinMode(_clk_pin, OUTPUT);
    pinMode(_data_pin, OUTPUT);

    setColorRGB(0, 0, 0);
}

void RGBLED::clk(void)
{
    digitalWrite(_clk_pin, LOW);
    delayMicroseconds(_CLK_PULSE_DELAY); 
    digitalWrite(_clk_pin, HIGH);
    delayMicroseconds(_CLK_PULSE_DELAY);   
}

void RGBLED::sendByte(byte b)
{
    // Send one bit at a time, starting with the MSB
    for (byte i=0; i<8; i++)
    {
        // If MSB is 1, write one and clock it, else write 0 and clock
        if ((b & 0x80) != 0)
            digitalWrite(_data_pin, HIGH);
        else
            digitalWrite(_data_pin, LOW);
        clk();

        // Advance to the next bit to send
        b <<= 1;
    }
}
 
void RGBLED::sendColor(byte red, byte green, byte blue)
{
    // Start by sending a byte with the format "1 1 /B7 /B6 /G7 /G6 /R7 /R6"
    byte prefix = B11000000;
    if ((blue & 0x80) == 0)     prefix|= B00100000;
    if ((blue & 0x40) == 0)     prefix|= B00010000; 
    if ((green & 0x80) == 0)    prefix|= B00001000;
    if ((green & 0x40) == 0)    prefix|= B00000100;
    if ((red & 0x80) == 0)      prefix|= B00000010;
    if ((red & 0x40) == 0)      prefix|= B00000001;
    sendByte(prefix);
        
    // Now must send the 3 colors
    sendByte(blue);
    sendByte(green);
    sendByte(red);
}

void RGBLED::setColorRGB(byte red, byte green, byte blue)
{
    // Send data frame prefix (32x "0")
    sendByte(0x00);
    sendByte(0x00);
    sendByte(0x00);
    sendByte(0x00);
    
    sendColor(red,green,blue);

    // Terminate data frame (32x "0")
    sendByte(0x00);
    sendByte(0x00);
    sendByte(0x00);
    sendByte(0x00);
}

void RGBLED::setColorHSB(float hue, float saturation, float brightness)
{
    float r, g, b;
    
    constrain(hue, 0.0, 1.0);
    constrain(saturation, 0.0, 1.0);
    constrain(brightness, 0.0, 1.0);

    if(saturation == 0.0)
    {
        r = g = b = brightness;
    }
    else
    {
        float q = brightness < 0.5 ? 
            brightness * (1.0 + saturation) : brightness + saturation - brightness * saturation;
        float p = 2.0 * brightness - q;
        r = hue2rgb(p, q, hue + 1.0/3.0);
        g = hue2rgb(p, q, hue);
        b = hue2rgb(p, q, hue - 1.0/3.0);
    }

    setColorRGB((byte)(255.0*r), (byte)(255.0*g), (byte)(255.0*b));
}

// --------------------------------------------------------------------------------------

float hue2rgb(float p, float q, float t)
{
    if (t < 0.0) 
        t += 1.0;
    if(t > 1.0) 
        t -= 1.0;
    if(t < 1.0/6.0) 
        return p + (q - p) * 6.0 * t;
    if(t < 1.0/2.0) 
        return q;
    if(t < 2.0/3.0) 
        return p + (q - p) * (2.0/3.0 - t) * 6.0;

    return p;
}
