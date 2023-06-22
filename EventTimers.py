
import json
from Store import *
from EventTimerModel import *
from datetime import datetime

class EventTimers:
    
    data = []
    
    def __init__(self):
        self.store = Store('event_timers')
        #self.data = self.read()
        self.read()
        self.max_id_store = Store('event_timers_max_id')
    
    def read(self):
        self.data = []
        data = self.store.read()
        if data:
            self.data = json.loads(data)
        return self.data
    
    def _readMaxId(self):
        id = self.max_id_store.read()
        if id:
            return int(id)
        return 1
    
    def _writeMaxId(self, id):
        self.max_id_store.write(str(id))
        
    def write(self):
        self.store.write(json.dumps(self.data))
        
    def get(self, **kwargs):
        self.read()
        for d in self.data:
            days_of_week_list = str(d['dow']).split(',') # handle blank/all days            
            if str(kwargs['dow']) in days_of_week_list:
                # Return event if date is within the event timer datetime and
                # the the duration in seconds
                current_datetime = datetime(
                    kwargs['YY'],
                    kwargs['MM'],
                    kwargs['dd'],
                    kwargs['hh'],
                    kwargs['mm'],
                    kwargs['ss']
                )
                event_datetime = datetime(
                    kwargs['YY'],
                    kwargs['MM'],
                    kwargs['dd'],
                    d['hh'],
                    d['mm'],
                    d['ss']
                )
                if (current_datetime - event_datetime).seconds < (d['duration'] * 60):
                    return EventTimerModel(**d)
        return None
    
    def getById(self, id):
        self.read()
        for d in self.data:
            if d['_id'] == id:
                return d
    
    
    def all(self):
        self.read()
        return self.data
        
    def add(self, **kwargs):
        _id = self._readMaxId()
        kwargs['_id'] =_id
        event_timer = EventTimerModel(**kwargs)
        duplicate = False
        for d in self.data:
            if d:
                existing_event_timer = EventTimerModel(**d)
                if event_timer == existing_event_timer:
                    duplicate = True
        if not duplicate:
            self.data.append(event_timer.__dict__)
            new_id = _id + 1
            self._writeMaxId(new_id)
            return _id
    
    def edit(self, **kwargs):
        event_timer = EventTimerModel(**kwargs)
        c = 0
        for d in self.data:
            if d['_id'] == event_timer._id:
                self.data[c] = event_timer.__dict__
            c += 1
        
    def remove(self, _id):
        c = 0
        for d in self.data:
            if d['_id'] == _id:
                del self.data[c]
            c += 1
        
        