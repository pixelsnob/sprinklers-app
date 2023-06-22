from machine import Pin
from time import sleep

p1 = Pin(16, mode=Pin.OUT, value=1)
p2 = Pin(17, mode=Pin.OUT, value=1)
p3 = Pin(18, mode=Pin.OUT, value=1)

v = 0

t = 0.0102

while True:
    p1.value(v)
    #sleep(0.01)
    p2.value(v)
    
    p3.value(v)
    #p3.value(0)
    if v == 0:
        v = 1
    else:
        v = 0
    sleep(t)
    #t = t - 0.000005
    