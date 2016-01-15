#ifndef MOTO_H
#define MOTO_H

#define SPEEPUP_STEP 20

typedef enum{
    ROTATE,
    REVERSAL,
    STOP
}moto_state_t;
/*   
 *   The _anodePin must has the PWM function
 */
class Moto{
  private:
    int _anodePin;
    int _cathodePin;
    int _power;
    moto_state_t _state;
  public:
    Moto(int _anodePin,int _cathodePin);
    void begin(void);
    void rotate(int power);
    void reversal(void);
    void speedup(void);
    void speedown(void);
    void stop(void);
};
#endif
