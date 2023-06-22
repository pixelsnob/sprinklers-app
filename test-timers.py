from machine import Pin, SoftI2C
from EventTimers import *
from datetime import datetime, timedelta
from ds3231_gen import *

i2c = SoftI2C(
    scl=Pin(15, Pin.OPEN_DRAIN, value=1),
    sda=Pin(14, Pin.OPEN_DRAIN, value=1)
)
ds3231 = DS3231(i2c)

YY, MM, dd, hh, mm, ss, dow, _ = ds3231.get_time()
current_time = datetime(YY, MM, dd, hh, mm, 0)
        
event_timers = EventTimers()

event_timers.read()

print(current_time, current_time + timedelta(minutes=1))
print(current_time.hour, current_time.minute, current_time.second)

# Populate event timers for 10 minutes
i = 0
relay_id = 1
while i < 10:
    
    event_timers.add(relay_id=str(relay_id), dow=str(dow), hh=current_time.hour, mm=current_time.minute, ss=0, duration=0.5)
    i += 1
    if relay_id == 3:
         relay_id = 1   
    else:
        relay_id += 1
    
    current_time = current_time + timedelta(minutes=1)
    #dt = dt + timedelta(minutes=1)

event_timers.write()

print(event_timers.read())
#event_timer_datetime + timedelta(minutes=active_event_timer.duration