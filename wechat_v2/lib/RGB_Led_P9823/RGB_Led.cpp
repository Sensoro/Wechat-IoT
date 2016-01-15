#include "RGB_Led.h"
#include "p9823.h"

float hue2rgb(float p, float q, float t);

RGB_Led::RGB_Led(int data_pin) :_data_pin(data_pin)
{
}

void RGB_Led::begin(void)
{
    drv_data_pin_cfg(_data_pin);
}

void RGB_Led::setColorRGB(uint8_t red, uint8_t green, uint8_t blue)
{
  
	drv_send_byte(red);
	drv_send_byte(green);
	drv_send_byte(blue);
    drv_reset();
}

void RGB_Led::setColorHSB(float hue, float saturation, float brightness)
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

    setColorRGB((uint8_t)(255.0*r), (uint8_t)(255.0*g), (uint8_t)(255.0*b));
}

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
