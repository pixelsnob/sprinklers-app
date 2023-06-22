
class EventTimerModel:
    
    _id       = 0
    relay_id  = ''
    dow       = ''
    hh        = 0
    mm        = 0
    ss        = 0
    duration  = 0
    
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
        
    def get(self):
        pass
            
    def __eq__(self, other):
        return self.hh == other.hh and \
            self.mm == other.mm and \
            self.ss == other.ss and \
            self.duration == other.duration and \
            self.relay_id == other.relay_id and \
            self.dow == other.dow
            