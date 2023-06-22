
from Store import *

class EventTimersState:
    
    state = True
    
    def __init__(self):
        self.store = Store('event_timer_state')
        self.read()
    
    def read(self):
        data = self.store.read()
        if not data:
            data = 0
        if int(data) == 0:
            self.state = False
        else:
            self.state = True
        return self.state
        
    def write(self):
        data = 0
        if self.state:
            data = 1
        self.store.write(str(data))
        
    def getState(self):
        self.read()
        if self.state == 0:
            return False
        return True
            
    def setState(self, val):
        self.state = val