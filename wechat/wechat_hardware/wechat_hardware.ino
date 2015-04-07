/* Because the UNO has only one Serail, and the wechat module will use a Serial. 
 * If using the hardware serial, these is a upload problem when wechat module is on the board.
 * So in this demo,we select SoftwareSerial communicate with module.
 */

#include <SoftwareSerial.h>
#include "CmdFifoQueue.h"
#include "Moto.h"
#include "RGBLED.h"
#include "DHT11.h"

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

//New a cmd queue with size 8,the cmdQueue may more proper when using hardware Serial
//When using SoftwareSerial, it's ok ,but someting like "ji lei"
CmdFifoQueue cmdFifoQue(8);
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
  //hardware Serial 
/*
  Serial.begin(38400);
  while(!Serial);
*/
//SoftwareSerial
  mySerial.begin(38400);
  rgbLed.begin();
  moto.begin();
}
void loop() {
  
//SoftwareSerial receive the cmd and put in queue
  if (mySerial.available())
  {
     int len=0;
     char buffer[32];
     do{
      buffer[len++]=mySerial.read();
     }while(mySerial.available());
      Cmd cmd;
      cmd.len = len;
      memcpy(cmd.data,buffer,len);
//      mySerial.write(cmd.data,cmd.len);
      //Put cmd into the cmd queue
      cmdFifoQue.cmdFifoPut(&cmd);
  }
  //if the queue is not empty, get cmd and execute it
  if(cmdFifoQue.cmdFifoEmpty()==false){
    Cmd cmd;
    //Get a cmd from the cmd queue.
    cmdFifoQue.cmdFifoGet(&cmd);
    
    if(!memcmp(cmd.data,GB_XIMIE,cmd.len)){
      flag_rgb_blink=false;
      flag_rgb_rainbow=false;
      rgbLed.setColorRGB(0,0,0);
    }
    else if(!memcmp(cmd.data,GB_LANSE,cmd.len)){
      flag_rgb_blink=false;
      flag_rgb_rainbow=false;
      rgbLed.setColorRGB(0,0,255);
    }
    else if(!memcmp(cmd.data,GB_HONGSE,cmd.len)){
      flag_rgb_blink=false;
      flag_rgb_rainbow=false;
      rgbLed.setColorRGB(255,0,0);
    }
    else if(!memcmp(cmd.data,GB_LVSE,cmd.len)){
      flag_rgb_blink=false;
      flag_rgb_rainbow=false;
      rgbLed.setColorRGB(0,255,0);
    }
    else if(!memcmp(cmd.data,GB_SHAN,cmd.len)){
      flag_rgb_blink=true;
      flag_rgb_rainbow=false;
    }
    else if(!memcmp(cmd.data,GB_BIAN,cmd.len)){
      flag_rgb_blink=false;
      flag_rgb_rainbow=true;
    }
    else if(!memcmp(cmd.data,GB_ZHUAN,cmd.len)){
      moto.rotate(50);
    }
    else if(!memcmp(cmd.data,GB_JIASU,cmd.len)){
      moto.speedup();
    }
    else if(!memcmp(cmd.data,GB_JIANSU,cmd.len)){
      moto.speedown();
    }
    else if(!memcmp(cmd.data,GB_TING,cmd.len)){
      moto.stop();
    }
    else if(!memcmp(cmd.data,GB_WENDU,cmd.len)){
      dht11.read();
//      Serial.print("Temperature (oC): ");
//      Serial.print((float)dht11.temperature, 2);
//      Serial.print("\n");
      mySerial.print("Temperature (oC): ");
      mySerial.print((float)dht11.temperature, 2);
      mySerial.print("\n");
    }
    else if(!memcmp(cmd.data,GB_SHIDU,cmd.len)){
      dht11.read();
//      Serial.print("Humidity (%): ");
//      Serial.print((float)dht11.humidity, 2);
//      Serial.print("\n");
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
//hardwareSerial receive the cmd and put in queue
/*
void serialEvent(){
//statements
     int len=0;
     char buffer[32];
     int buffer_len=0;
     Serial.setTimeout(200);
     do{
      //Read 10 bytes from Serial one time
      len = Serial.readBytes(&buffer[buffer_len],10);
      buffer_len += len;
      //If there are some data more remain in the Serial, read again
      }while(len >= 10);
      Cmd cmd;
      cmd.len = buffer_len;
      memcpy(cmd.data,buffer,buffer_len);
      //Put cmd into the cmd queue
      cmdFifoQue.cmdFifoPut(&cmd);
}*/
