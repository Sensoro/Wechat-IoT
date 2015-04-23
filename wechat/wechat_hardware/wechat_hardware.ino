/* Because the UNO has only one Serail, and the wechat module will use a Serial. 
 * If using the hardware serial, these is a upload problem when wechat module is on the board.
 * So in this demo,we select SoftwareSerial communicate with module.
 */

#include <SoftwareSerial.h>
#include "Moto.h"
#include "RGBLED.h"
#include "DHT11.h"

#define CMD_GB2312_CODE_MAX_LEN  32
#define CMD_REC_TIME_OUT         2000
//Cmd, which is the GB2312 codes of the Chinese character
#define GB_LANSE      "C0B6C9AB"
#define GB_HONGSE     "BAECC9AB"
#define GB_LVSE       "C2CCC9AB"
#define GB_SHAN       "C9C1"
#define GB_BIAN       "B1E4"
#define GB_CAIHONG    "B2CABAE7"
#define GB_XIMIE      "CFA8C3F0"
#define GB_ZHUAN      "D7AA"
#define GB_TING       "CDA3"
#define GB_JIASU      "BCD3CBD9"
#define GB_JIANSU     "BCF5CBD9"
#define GB_WENDU      "CEC2B6C8"
#define GB_SHIDU      "CAAAB6C8"
/*
Add your own cmd gb2312 code here 
 */

// Definition of pins
#define RGB_SCL         A5
#define RGB_SDA         A4
#define MOTO_ANODE      5
#define MOTO_CATHODE    4
#define DHT_PIN         3
#define SOFTSERIAL_RX   6
#define SOFTSERIAL_TX   7

//New a RGB led
RGBLED  rgbLed(RGB_SCL,RGB_SDA);
//New a moto
Moto moto(MOTO_ANODE,MOTO_CATHODE);
//New a DHT11
DHT11 dht11(DHT_PIN);
//New a SoftwareSerial
SoftwareSerial mySerial(SOFTSERIAL_RX, SOFTSERIAL_TX); // RX, TX

bool flag_rgb_blink=false;
bool flag_rgb_rainbow=false;
unsigned long previousMillis = 0;

void setup() {
  //Hardware Serial 
  Serial.begin(38400);
  while(!Serial);
 //SoftwareSerial
  mySerial.begin(38400);
  Serial.println("start");
  rgbLed.begin();
  moto.begin();
}
void loop() {
  
 //SoftwareSerial receive the cmd 
  if (mySerial.available())
  {
     int len=0;
     // The buffer size is now 32. So the max length of Cmd is 8 Chinese characters.
     char buffer[CMD_GB2312_CODE_MAX_LEN];
     unsigned long  beforRecTime =millis();
     unsigned long  recTime = beforRecTime;
     
     Serial.print("all character:");
     while(recTime - beforRecTime < CMD_REC_TIME_OUT){
       buffer[len]=mySerial.read();
       Serial.print(" ");
       Serial.print(buffer[len]);
       //if encounter '\n' or len large than max len ,break
       if(buffer[len]=='\n' ||  len>CMD_GB2312_CODE_MAX_LEN-1){
         break;
       }
       len++;
       recTime= millis();
     }
     Serial.print("rec cmd: ");
     Serial.write(buffer,len);
     Serial.println("");
     if(!memcmp(buffer,GB_XIMIE,len)&&len==strlen(GB_XIMIE)){  
       flag_rgb_blink=false;
       flag_rgb_rainbow=false;
       rgbLed.setColorRGB(0,0,0);
     }
     else if(!memcmp(buffer,GB_LANSE,len)&&len==strlen(GB_LANSE)){
       flag_rgb_blink=false;
       flag_rgb_rainbow=false;
       rgbLed.setColorRGB(0,0,255);
     }
     else if(!memcmp(buffer,GB_HONGSE,len)&&len==strlen(GB_HONGSE)){
       flag_rgb_blink=false;
       flag_rgb_rainbow=false;
       rgbLed.setColorRGB(255,0,0);
     }
     else if(!memcmp(buffer,GB_LVSE,len)&&len==strlen(GB_LVSE)){
      flag_rgb_blink=false;
      flag_rgb_rainbow=false;
      rgbLed.setColorRGB(0,255,0);
     }
     else if(!memcmp(buffer,GB_SHAN,len)&&len==strlen(GB_SHAN)){
      flag_rgb_blink=true;
      flag_rgb_rainbow=false;
     }
     else if(!memcmp(buffer,GB_BIAN,len)&&len==strlen(GB_BIAN)){
       flag_rgb_blink=false;
       flag_rgb_rainbow=true;
     }
     else if(!memcmp(buffer,GB_ZHUAN,len)&&len==strlen(GB_ZHUAN)){
       moto.rotate(50);
     }
     else if(!memcmp(buffer,GB_JIASU,len)&&len==strlen(GB_JIASU)){
       moto.speedup();
     }
     else if(!memcmp(buffer,GB_JIANSU,len)&&len==strlen(GB_JIANSU)){
       moto.speedown();
     }
     else if(!memcmp(buffer,GB_TING,len)&&len==strlen(GB_TING)){
       moto.stop();
     }
     else if(!memcmp(buffer,GB_WENDU,len)&&len==strlen(GB_WENDU)){
       dht11.read();
       mySerial.print("Temperature (oC): ");
       mySerial.print((float)dht11.temperature, 2);
       mySerial.print("\n");
     }
     else if(!memcmp(buffer,GB_SHIDU,len)&&len==strlen(GB_SHIDU)){
       dht11.read();
       mySerial.print("Humidity (%): ");
       mySerial.print((float)dht11.humidity, 2);
       mySerial.print("\n");
     }
    /*
    Add your own code of cmd decoding here 
    */
  }
  if(flag_rgb_blink)
  {
    unsigned long currentMillis = millis();
    static unsigned long rgb= 0x000000ff;
    if(currentMillis - previousMillis >= 200) {
      previousMillis = currentMillis;
        rgbLed.setColorRGB(rgb&0xff,(rgb&0x0000ff00)>>8,(rgb&0x00ff0000)>>16);
        rgb = rgb<<8;
        if(rgb==0xff000000)
          rgb=0x000000ff;
    }
  }
  else if(flag_rgb_rainbow)
  {
    static float hue = 0.0;
    static bool up = true;
    unsigned long currentMillis = millis();
    if(currentMillis - previousMillis >= 200) {
      previousMillis = currentMillis;
      rgbLed.setColorHSB(hue,1.0,0.5);
      if (up)
        hue+= 0.025;
      else
        hue-= 0.025;
      if (hue>=1.0 && up)
        up = false;
      else if (hue<=0.0 && !up)
        up = true;
    }
  }
}
