#ifndef CMD_FIFO_QUEUE_H
#define CMD_FIFO_QUEUE_H

class Cmd{
public:
  int len;
  char data[20];
};

class CmdFifoQueue{
private:
  int head;
  int tail;
  int _size;
  Cmd * pCmd;
public:
  CmdFifoQueue(int size);
  ~CmdFifoQueue();
  bool cmdFifoFull(void);
  bool cmdFifoEmpty(void);
  int cmdFifoGetLength(void);
  int cmdFifoPut(Cmd * pcmd);
  bool cmdFifoGet(Cmd * pcmd);
};

#endif

