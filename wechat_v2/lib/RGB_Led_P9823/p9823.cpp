#include "p9823.h"
#include "Arduino.h"

#define DIN_HIGH		*mp_out |= m_bit
#define DIN_LOW   		*mp_out &= ~m_bit
#define DELAYUS			delayMicroseconds

#define DELAY_LONG_NS 	{_NOP();_NOP();_NOP();_NOP();_NOP();\
  						 _NOP();_NOP();_NOP();_NOP();_NOP();\
  						 _NOP();_NOP();_NOP();_NOP();_NOP();\
  						 _NOP();_NOP();_NOP();}

#define DELAY_SHORT_NS 	{_NOP();}

#define DELAY_RESET		DELAYUS(50)

static uint8_t 			m_bit;
static volatile uint8_t *mp_out;

static __inline void send_high_bit(void);
static __inline void send_low_bit(void);

void drv_data_pin_cfg(uint8_t pin)
{
	uint8_t port;
	pinMode(pin, OUTPUT);

	m_bit  = digitalPinToBitMask(pin);
	port   = digitalPinToPort(pin);
	mp_out = portOutputRegister(port);
	
}

void drv_send_byte(uint8_t data)
{
	uint8_t i;
	for(i=0;i<8;i++)
	{
		if(data&0x80)
		{
			send_high_bit();
		}
		else
		{
			send_low_bit();
		}
		data <<= 1;
	}
}

void drv_reset(void)
{
	DIN_LOW;
	DELAY_RESET;
}

static __inline void send_high_bit(void)
{
  DIN_HIGH;
  DELAY_LONG_NS;
  
  DIN_LOW;
  DELAY_SHORT_NS;
}

static __inline void send_low_bit(void)
{
  DIN_HIGH;
  DELAY_SHORT_NS;
 
  DIN_LOW;
  DELAY_LONG_NS;
}
