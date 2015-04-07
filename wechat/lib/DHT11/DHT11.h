#ifndef DHT11_H
#define DHT11_H

#define DHTLIB_OK				0
#define DHTLIB_ERROR_CHECKSUM	-1
#define DHTLIB_ERROR_TIMEOUT	-2

class DHT11
{
private:
	int _pin;
public:
	DHT11(int pin);
	int read(void);
	
	int humidity;
	int temperature;
};

#endif
