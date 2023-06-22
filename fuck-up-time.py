from machine import Pin, Timer, RTC, SoftI2C
from ds3231_gen import *

#(year, month, day, hour, minute, second, weekday, yearday)

i2c = SoftI2C(scl=Pin(15, Pin.OPEN_DRAIN, value=1), sda=Pin(14, Pin.OPEN_DRAIN, value=1))

ds3231 = DS3231(i2c)

ds3231.set_time((2019, 10, 30, 12, 59, 48, 6, 0))
print(ds3231.get_time())