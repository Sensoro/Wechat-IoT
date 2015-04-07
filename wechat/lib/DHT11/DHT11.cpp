#include "DHT11.h"
#include "Arduino.h"

DHT11::DHT11(int pin){
	_pin = pin;
}

/**@brief: Read the temperature and the humidity data
 *
 * @retval DHTLIB_OK                 DHT11 read success
 * @retval DHTLIB_ERROR_CHECKSUM     DHT11 result check error
 * @retval DHTLIB_ERROR_TIMEOUT	     DHT11 read time out 
 */
int DHT11::read(void)
{
	// BUFFER TO RECEIVE
	uint8_t bits[5];
	uint8_t cnt = 7;
	uint8_t idx = 0;

	// EMPTY BUFFER
	for (int i=0; i< 5; i++) bits[i] = 0;

	// REQUEST SAMPLE
	pinMode(_pin, OUTPUT);
	digitalWrite(_pin, LOW);
	delay(18);
	digitalWrite(_pin, HIGH);
	delayMicroseconds(40);
	pinMode(_pin, INPUT);

	// ACKNOWLEDGE or TIMEOUT
	unsigned int loopCnt = 10000;
	while(digitalRead(_pin) == LOW)
		if (loopCnt-- == 0) return DHTLIB_ERROR_TIMEOUT;

	loopCnt = 10000;
	while(digitalRead(_pin) == HIGH)
		if (loopCnt-- == 0) return DHTLIB_ERROR_TIMEOUT;

	// READ OUTPUT - 40 BITS => 5 BYTES or TIMEOUT
	for (int i=0; i<40; i++)
	{
		loopCnt = 10000;
		while(digitalRead(_pin) == LOW)
			if (loopCnt-- == 0) return DHTLIB_ERROR_TIMEOUT;

		unsigned long t = micros();

		loopCnt = 10000;
		while(digitalRead(_pin) == HIGH)
			if (loopCnt-- == 0) return DHTLIB_ERROR_TIMEOUT;

		if ((micros() - t) > 40) bits[idx] |= (1 << cnt);
		if (cnt == 0)   // next byte?
		{
			cnt = 7;    // restart at MSB
			idx++;      // next byte!
		}
		else cnt--;
	}

	// WRITE TO RIGHT VARS
        // as bits[1] and bits[3] are allways zero they are omitted in formulas.
	humidity    = bits[0]; 
	temperature = bits[2]; 

	uint8_t sum = bits[0] + bits[2];  

	if (bits[4] != sum) return DHTLIB_ERROR_CHECKSUM;
	return DHTLIB_OK;
}
