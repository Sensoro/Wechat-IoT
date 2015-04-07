#include "CmdFifoQueue.h"
#include <string.h>
#include <stdlib.h>

CmdFifoQueue::CmdFifoQueue(int size){
  _size = size;
  pCmd =(Cmd *)malloc(_size);
}

CmdFifoQueue::~CmdFifoQueue(){
  free(pCmd);
}

bool CmdFifoQueue::cmdFifoFull(void){
  return ((tail + _size) == head);
}

bool CmdFifoQueue::cmdFifoEmpty(void){
  return (head == tail);
}
int CmdFifoQueue::cmdFifoGetLength(void){
  return (head - tail) & 0xFF;
}
int CmdFifoQueue::cmdFifoPut(Cmd * pcmd){
  if (cmdFifoFull())
    {
      return _size;
    }
    
    Cmd * phead = &pCmd[head & (_size-1)];
    
    memcpy(phead, pcmd, sizeof(Cmd));
    
    return ((head++) & (_size-1));
}
bool CmdFifoQueue::cmdFifoGet(Cmd * pcmd){
   if (cmdFifoEmpty()){
        return false;
   }
   Cmd* ptail = &pCmd[tail & (_size-1)];
    
    memcpy(pcmd, ptail, sizeof(Cmd));
    ++tail;
    return true;
}


