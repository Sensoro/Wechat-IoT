#ifndef P9823_H
#define P9823_H

#include "stdint.h"
void drv_reset(void);

void drv_data_pin_cfg(uint8_t pin);

void drv_send_byte(uint8_t data);

#endif
