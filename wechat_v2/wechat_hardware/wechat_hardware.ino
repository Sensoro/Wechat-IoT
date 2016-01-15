/* Because the UNO has only one Serail, and the wechat module will use a Serial. 
 * If using the hardware serial, these is a upload problem when wechat module is on the board.
 * So in this demo,we select SoftwareSerial communicate with module.
 */
#include <SoftwareSerial.h>
#include <MsTimer2.h>
#include "Moto.h"
#include "RGB_Led.h"
#include "DHT11.h"

#define CMD_GB2312_CODE_MAX_LEN   32
#define CMD_REC_TIME_OUT          2000

//Cmd, which is the GB2312 codes of the Chinese character
#define GB_BLUE                   "C0B6C9AB"  //"蓝色"
#define GB_RED                    "BAECC9AB"  //"红色"
#define GB_GREEN                  "C2CCC9AB"  //"绿色"
#define GB_BLINK                  "C9C1"      //"闪"
#define GB_CHANGE                 "B1E4"      //"变"
#define GB_EXTINGUISH             "CFA8C3F0"  //"熄灭"
#define GB_ROTATE                 "D7AA"      //"转"
#define GB_STOP                   "CDA3"      //"停"
#define GB_SPEEDUP                "BCD3CBD9"  //"加速"
#define GB_SPEEDDOWN              "BCF5CBD9"  //"减速"
#define GB_TEMP                   "CEC2B6C8"  //"温度"
#define GB_HUMI                   "CAAAB6C8"  //"湿度"
#define GB_BUZZ                   "B5CE"      //"滴"
/*
Add your own cmd gb2312 code here 
 */

// Definition of pins
#define RGB_LED_PIN               8
#define MOTO_ANODE_PIN            5
#define MOTO_CATHODE_PIN          6
#define DHT_PIN                   2
#define SOFTSERIAL_RX_PIN         10
#define SOFTSERIAL_TX_PIN         11
#define BUZZER_PIN                3
#define KEY1_PIN                  7
#define KEY2_PIN                  4

#define RGB_RATIO                 25   // 255(100%),here sets about %10,<免得亮瞎>
#define MOTO_DEF_SPEED            50   // 255(100%),default 50

typedef enum
{
  RGB_STATE_EXTINGUISH,
  RGB_STATE_SINGLE,
  RGB_STATE_BLINK,
  RGB_STATE_RAINBOW
}rgb_state_t;

//New a RGB led
RGB_Led  rgbLed(RGB_LED_PIN);

//New a moto
Moto moto(MOTO_ANODE_PIN,MOTO_CATHODE_PIN);

//New a DHT11
DHT11 dht11(DHT_PIN);

//New a SoftwareSerial
SoftwareSerial mySerial(SOFTSERIAL_RX_PIN, SOFTSERIAL_TX_PIN); // RX, TX


rgb_state_t   rgb_led_state   = RGB_STATE_EXTINGUISH;
unsigned long previousMillis  = 0;

void setup() {
  //Hardware Serial 
  Serial.begin(38400);
  while(!Serial);
  
 //SoftwareSerial
  mySerial.begin(38400);
  Serial.println("start");
  
  rgbLed.begin();
  rgbLed.setColorRGB(0,0,0);
  
  moto.begin(); 
  
  pinMode(BUZZER_PIN,OUTPUT);
  pinMode(KEY1_PIN,INPUT_PULLUP);
  pinMode(KEY2_PIN,INPUT_PULLUP);

  MsTimer2::set(200, rgb_timeout_handler);
  MsTimer2::start();
  
}
void loop() {
  
 //SoftwareSerial receive the cmd 
  if (mySerial.available())
  {
     int len=0;
     // The buffer size is now 32. So the max length of Cmd is 8 Chinese characters.
     char buffer[CMD_GB2312_CODE_MAX_LEN];
     unsigned long  startRecTimePoint = millis();
     unsigned long  recTime           = startRecTimePoint;
     
     Serial.print("all character:");
     while(recTime - startRecTimePoint < CMD_REC_TIME_OUT){  //If there is no timeout
       buffer[len]=mySerial.read();
       Serial.print(" ");
       Serial.print(buffer[len]);
       //if encounter '\n' or len large than max len ,break
       if(buffer[len]=='\n' ||buffer[len]=='\r'||  len>=CMD_GB2312_CODE_MAX_LEN){
         break;
       }
       len++;
       recTime= millis();
     }
     Serial.print("rec cmd: ");
     Serial.write(buffer,len);
     Serial.println("");
     if(!memcmp(buffer,GB_EXTINGUISH,len)&&len==strlen(GB_EXTINGUISH)){  
       rgb_led_state = RGB_STATE_EXTINGUISH;
       rgbLed.setColorRGB(0,0,0);
     }
     else if(!memcmp(buffer,GB_BLUE,len)&&len==strlen(GB_BLUE)){
       rgb_led_state = RGB_STATE_SINGLE;
       rgbLed.setColorRGB(0,0,RGB_RATIO); 
     }
     else if(!memcmp(buffer,GB_RED,len)&&len==strlen(GB_RED)){
       rgb_led_state = RGB_STATE_SINGLE;
       rgbLed.setColorRGB(RGB_RATIO,0,0);
     }
     else if(!memcmp(buffer,GB_GREEN,len)&&len==strlen(GB_GREEN)){
      rgb_led_state = RGB_STATE_SINGLE;
      rgbLed.setColorRGB(0,RGB_RATIO,0);
     }
     else if(!memcmp(buffer,GB_BLINK,len)&&len==strlen(GB_BLINK)){
      rgb_led_state = RGB_STATE_BLINK;
     }
     else if(!memcmp(buffer,GB_CHANGE,len)&&len==strlen(GB_CHANGE)){
       rgb_led_state = RGB_STATE_RAINBOW;
     }
     else if(!memcmp(buffer,GB_ROTATE,len)&&len==strlen(GB_ROTATE)){
       moto.rotate(MOTO_DEF_SPEED);
     }
     else if(!memcmp(buffer,GB_SPEEDUP,len)&&len==strlen(GB_SPEEDUP)){
       moto.speedup();
     }
     else if(!memcmp(buffer,GB_SPEEDDOWN,len)&&len==strlen(GB_SPEEDDOWN)){
       moto.speedown();
     }
     else if(!memcmp(buffer,GB_STOP,len)&&len==strlen(GB_STOP)){
       moto.stop();
     }
     else if(!memcmp(buffer,GB_TEMP,len)&&len==strlen(GB_TEMP)){
       dht11.read();
       mySerial.print("Temperature (oC): ");
       mySerial.print((float)dht11.temperature, 2);
       mySerial.print("\n");
     }
     else if(!memcmp(buffer,GB_HUMI,len)&&len==strlen(GB_HUMI)){
       dht11.read();
       mySerial.print("Humidity (%): ");
       mySerial.print((float)dht11.humidity, 2);
       mySerial.print("\n");
     }
     else if(!memcmp(buffer,GB_BUZZ,len)&&len==strlen(GB_BUZZ)){
      digitalWrite(BUZZER_PIN,HIGH);
      delay(100);
      digitalWrite(BUZZER_PIN,LOW);
     }
    /*
    Add your own code of cmd decoding here 
    */
  }
  
  if(digitalRead(KEY1_PIN)==LOW){
    digitalWrite(BUZZER_PIN,HIGH);
    while(digitalRead(KEY1_PIN)==LOW); //blocking！！
    digitalWrite(BUZZER_PIN,LOW);
  }
  if(digitalRead(KEY2_PIN)==LOW){
    digitalWrite(BUZZER_PIN,HIGH);
    while(digitalRead(KEY2_PIN)==LOW); //blocking！！
    digitalWrite(BUZZER_PIN,LOW);
  }
}

void rgb_timeout_handler(){
  if(RGB_STATE_BLINK == rgb_led_state){
     static unsigned long rgb= 0x00000019;     //0x19 = 25 
     rgbLed.setColorRGB(rgb&0x19,(rgb&0x00001900)>>8,(rgb&0x00190000)>>16);
     rgb = rgb<<8;
     if(rgb==0x19000000){
      rgb=0x00000019;
     }
  }
  if(RGB_STATE_RAINBOW == rgb_led_state){
    static float hue = 0.0;
    static bool up = true;
    rgbLed.setColorHSB(hue,1.0,0.1);
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

