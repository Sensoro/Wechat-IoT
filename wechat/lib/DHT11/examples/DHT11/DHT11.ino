#include "DHT11.h"

#define DHT11_PIN 3

DHT11 dht11(DHT11_PIN);
void setup()
{
  Serial.begin(9600);
  Serial.println("DHT11 TEST PROGRAM ");
}

void loop()
{
  Serial.println("\n");
  
  int chk = dht11.read();

  Serial.print("Read sensor: ");
  switch (chk)
  {
    case DHTLIB_OK: 
                Serial.println("OK"); 
                break;
    case DHTLIB_ERROR_CHECKSUM: 
                Serial.println("Checksum error"); 
                break;
    case DHTLIB_ERROR_TIMEOUT: 
                Serial.println("Time out error"); 
                break;
    default: 
                Serial.println("Unknown error"); 
                break;
  }

  Serial.print("Humidity (%): ");
  Serial.println((float)dht11.humidity, 2);

  Serial.print("Temperature (oC): ");
  Serial.println((float)dht11.temperature, 2);

  Serial.print("Temperature (oF): ");
  Serial.println(Fahrenheit(dht11.temperature), 2);

  Serial.print("Temperature (K): ");
  Serial.println(Kelvin(dht11.temperature), 2);

  Serial.print("Dew Point (oC): ");
  Serial.println(dewPoint(dht11.temperature, dht11.humidity));

  Serial.print("Dew PointFast (oC): ");
  Serial.println(dewPointFast(dht11.temperature, dht11.humidity));

  delay(2000);
}

double Fahrenheit(double celsius) 
{
        return 1.8 * celsius + 32;
}    //摄氏温度度转化为华氏温度

double Kelvin(double celsius)
{
        return celsius + 273.15;
}     //摄氏温度转化为开氏温度

// 露点（点在此温度时，空气饱和并产生露珠）
// 参考: http://wahiduddin.net/calc/density_algorithms.htm 
double dewPoint(double celsius, double humidity)
{
        double A0= 373.15/(273.15 + celsius);
        double SUM = -7.90298 * (A0-1);
        SUM += 5.02808 * log10(A0);
        SUM += -1.3816e-7 * (pow(10, (11.344*(1-1/A0)))-1) ;
        SUM += 8.1328e-3 * (pow(10,(-3.49149*(A0-1)))-1) ;
        SUM += log10(1013.246);
        double VP = pow(10, SUM-3) * humidity;
        double T = log(VP/0.61078);   // temp var
        return (241.88 * T) / (17.558-T);
}

// 快速计算露点，速度是5倍dewPoint()
// 参考: http://en.wikipedia.org/wiki/Dew_point
double dewPointFast(double celsius, double humidity)
{
        double a = 17.271;
        double b = 237.7;
        double temp = (a * celsius) / (b + celsius) + log(humidity/100);
        double Td = (b * temp) / (a - temp);
        return Td;
}

