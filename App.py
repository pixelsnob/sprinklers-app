import sys
from mqtt_as import MQTTClient, config as mqtt_async_config
from config import getConfig
from machine import Pin, SoftI2C
import uasyncio as asyncio
from uasyncio import Event
from ds3231_gen import *
from Store import *
from EventTimers import *
from EventTimersState import *
import _ntptime
import re
from time import sleep
from datetime import datetime, timedelta
import json
#import logging

class App:
        
    def __init__(self):
        
        self.main_config = getConfig()
        
        self.wifi_led = Pin(21, mode=Pin.OUT, value=1)
        self.mqtt_led = Pin(20, mode=Pin.OUT, value=1)
        self.exception_led = Pin(22, mode=Pin.OUT, value=1)
        self.builtin_led = Pin('LED', Pin.OUT, value=1)
        self.event_timers_enabled_led = Pin(26, Pin.OUT, value=1)
        
        sleep(0.5)
        
        self.wifi_led.off()
        self.mqtt_led.off()
        self.exception_led.off()
        self.event_timers_enabled_led.off()
        
        self.relays =  {
            '1': Pin(16, mode=Pin.OUT, value=1),
            '2': Pin(17, mode=Pin.OUT, value=1),
            '3': Pin(18, mode=Pin.OUT, value=1)
        }
        
        self.relays_state = {
            '1': False,
            '2': False,
            '3': False
        }
        
        self.previous_button_values = {
            '1': 1,
            '2': 1,
            '3': 1
        }
                
        self.buttons = {
             '1': Pin(9, Pin.IN, Pin.PULL_UP),
             '2': Pin(4, Pin.IN, Pin.PULL_UP),
             '3': Pin(8, Pin.IN, Pin.PULL_UP),
        }
        
        #self.off_button = Pin(13, Pin.IN, Pin.PULL_UP)
        #self.previous_off_button_value = None
        
        self.toggle_timer_button = Pin(12, Pin.IN, Pin.PULL_UP)
        
        self.mqtt_topic = self.main_config['mqtt_topic']
                
        self.previous_status = None # naming
        
        mqtt_async_config['server'] = self.main_config['mqtt_server']
        mqtt_async_config['client_id'] = self.main_config['client_id']
        mqtt_async_config['ssid'] = self.main_config['ssid']
        mqtt_async_config['wifi_pw'] = self.main_config['password']
        mqtt_async_config['subs_cb'] = lambda a, b, c: self.mqttCallback(a, b, c)
        
        # This is necessary because callback is bound to mqtt client
        onMqttConnect = self.onMqttConnect
        
        async def connectCoro(mclient):
            await onMqttConnect(mclient)
        
        mqtt_async_config['connect_coro'] = connectCoro
        mqtt_async_config['will'] = (b'%s/online' % self.mqtt_topic, '0', False)
        
        MQTTClient.DEBUG = True
        
        self.mqtt_client = MQTTClient(mqtt_async_config)

        #self.mqtt_client_is_connected = False
        
        i2c = SoftI2C(
            scl=Pin(15, Pin.OPEN_DRAIN, value=1),
            sda=Pin(14, Pin.OPEN_DRAIN, value=1)
        )

        self.ds3231 = DS3231(i2c)
                
        self.event_timers = EventTimers()
        self.event_timers_state = EventTimersState()
        self.event_timers_enabled = self.event_timers_state.getState()
        
        self.previous_toggle_timer_button_val = 1
        
        self.relays_hold = False
        
        self.last_active_event_timer = None
        
        self.turn_off_at = None
        
        self.active_event_timer = None

        #logging.basicConfig(filename='./log/sprinklers.log')
        
        #self.logger = logging.getLogger()
        
        # 'wifi_coro' [a null coro] A coroutine. Defines a task to run when the network state changes.
        # The coro receives a single bool arg being the network state.
    
    async def onMqttConnect(self, mclient):
        await mclient.subscribe(b'%s/#' % self.main_config['mqtt_topic'], 1)
        await asyncio.sleep_ms(20)
        await mclient.publish(b'%s/online' % self.mqtt_topic, '1', True)
        await asyncio.sleep_ms(20)
        await self.mqttPublishStatus()
        await asyncio.sleep_ms(30)
        await self.mqttPublishEventTimers()
        await asyncio.sleep_ms(0)
        
    async def connectionCheck(self):
        while True:
            if self.mqtt_client.isconnected():
                self.wifi_led.on()
                await asyncio.sleep_ms(500)
            else:
                self.wifi_led.toggle()
                await asyncio.sleep_ms(300)
        
    async def mqttConnect(self):
        while True:
            try:
                if not self.mqtt_client.isconnected():
                    await self.mqtt_client.connect()
                    await asyncio.sleep(10)
                else:
                    await asyncio.sleep(5)
            except Exception as e:
                sys.print_exception(e)
                #self.logger.warning('Can\'t connect to wifi')
                await asyncio.sleep(10)
    
    async def mqttMessageReceived(self):
        await asyncio.sleep(0)
        self.mqtt_led.on()
        await asyncio.sleep(1)
        self.mqtt_led.off()
        await asyncio.sleep(1)
    
    def mqttCallback(self, topic, message, retained):
        try:
            _topic = topic.decode()
            loop = asyncio.get_event_loop()
            matches = re.search(r'channel\/([1-3])/toggle', _topic)
            message_received = False
            if matches and len(matches.groups()):
                relay_id = matches.groups()[0]
                loop.create_task(self.cancelActiveEventTimer())
                loop.create_task(self.toggleRelay(relay_id))
                loop.create_task(self.mqttMessageReceived())
            elif re.search(r'event_timers/toggle$', _topic):
                self.event_timers_enabled = not self.event_timers_enabled
                loop.create_task(self.saveEventTimersState())
                loop.create_task(self.mqttMessageReceived())
            elif re.search(r'event_timers/request$', _topic):
                loop.create_task(self.mqttPublishEventTimers())
                loop.create_task(self.mqttMessageReceived())
            elif re.search(r'request_status$', _topic):
                loop.create_task(self.mqttPublishStatus())
                loop.create_task(self.mqttMessageReceived())
            elif re.search(r'event_timers/delete$', _topic):
                message_obj = json.loads(message)
                loop.create_task(self.mqttPublishEventTimerChange(message_obj['event_timer_id'], '', 'deleted'))
                self.deleteEventTimer(message_obj['event_timer_id'])
                loop.create_task(self.mqttPublishEventTimers())
                loop.create_task(self.mqttMessageReceived())
            elif re.search(r'event_timers/update$', _topic):
                message = json.loads(message)
                loop.create_task(self.mqttPublishEventTimerChange(message['event_timer']['_id'], '', 'updated'))
                self.editEventTimer(message['event_timer'])
                loop.create_task(self.mqttPublishEventTimers())
                loop.create_task(self.mqttMessageReceived())
            elif re.search(r'event_timers\/add$', _topic):
                message = json.loads(message)
                _id = self.addEventTimer(message['event_timer'])
                loop.create_task(self.mqttPublishEventTimerChange(_id, message['uid'], 'added'))
                loop.create_task(self.mqttPublishEventTimers())
                loop.create_task(self.mqttMessageReceived())
            #raise Exception('fuckety')
            #sleep(0.02)
            
        except Exception as e:
            sys.print_exception(e)
        
    async def mqttPublishStatusOnStateChange(self):
        while True:
            status = self.buildMqttStatusObject()
            if status['state'] != self.previous_status:
                await self.mqttPublishStatus()
                self.previous_status = status['state']
                await asyncio.sleep_ms(100)
            else:
                await asyncio.sleep(0)
    
    async def mqttPublishStatusPeriodically(self):
        while True:
            await self.mqttPublishStatus()
            await asyncio.sleep(30)
    
    async def mqttPublishStatus(self):
        if self.mqtt_client.isconnected():
            status = self.buildMqttStatusObject()
            await self.mqtt_client.publish(
                b'%s/status' % self.mqtt_topic,
                json.dumps(status),
                qos=0,
                retain=False
            )
    
    def buildMqttStatusObject(self):
        tempc = self.ds3231.temperature()
        YY, MM, dd, hh, mm, ss, dow, _ = self.ds3231.get_time()
        status = {
            'state': {
                'relays': {},
                'event_timers_enabled': self.event_timers_enabled,
                'active_event_timer': self.active_event_timer._id if self.active_event_timer else None
            },
            'tempc': tempc,
            'tempf': (tempc * 1.8) + 32,
            'datetime': {
                'YY': YY,
                'MM': MM,
                'dd': dd,
                'hh': hh,
                'mm': mm,
                'ss': ss,
                'dow': dow
            }
        }
        for r in self.relays:
            if self.relays[r].value() == 0:
                status['state']['relays'][r] = 'on'
            else:
                status['state']['relays'][r] = 'off'
        return status
    
    async def mqttPublishEventTimers(self):
        event_timers = self.event_timers.all()
        await self.mqtt_client.publish(
            b'%s/event_timers/list' % self.mqtt_topic,
            json.dumps(event_timers),
            qos=0,
            retain=False
        )
    
    async def mqttPublishEventTimerChange(self, _id, uid=None, action='added'):
        await self.mqtt_client.publish(
            b'%s/event_timers/changed/%s' % (self.mqtt_topic, action),
            json.dumps({ '_id': _id, 'uid': uid }),
            qos=0,
            retain=False
        )
        
    async def toggleRelay(self, relay_id, action='toggle'):
        if self.relays_hold:
            return None
        state_change = False
        self.relays_hold = True
        if self.relays[relay_id].value() == 0:
            # Turn off
            if action == 'toggle' or action == 'off':
                self.relays[relay_id].value(1)
                state_change = True
        elif action != 'off':
            turned_off_count = 0
            # Turn on after turning off any others
            for r in self.relays:
                if r != relay_id and self.relays[r].value() == 0:
                    self.relays[r].value(1)
                    turned_off_count += 1
            if turned_off_count > 0:
                await asyncio.sleep(1) # <-- Water pressure delay
            self.relays[relay_id].value(0)
            state_change = True
        self.relays_hold = False
        return state_change
        
    async def pollRelayButtonsState(self):
        while True:
            for b in self.buttons:
                button_val = self.buttons[b].value()
                if button_val != self.previous_button_values[b]:
                    if button_val == 0:
                        await self.cancelActiveEventTimer()
                        await self.toggleRelay(b)
                self.previous_button_values[b] = button_val
            await asyncio.sleep_ms(20)
    
#     async def pollRelayOffButtonState(self):
#         while True:
#             button_val = self.off_button.value()
#             if button_val != self.previous_off_button_value:
#                 if button_val == 0:
#                     for r in self.relays:
#                         if self.relays[r].value() == 0:
#                             # Turn off if on
#                             await self.cancelActiveEventTimer()
#                             await self.toggleRelay(r, 'off')
#                 self.previous_off_button_value = button_val
#             await asyncio.sleep_ms(20)
            
    async def eventTimerLed(self):
        while True:
            if self.event_timers_enabled:
                if self.active_event_timer:
                    self.event_timers_enabled_led.toggle()
                    await asyncio.sleep(1)
                else:
                    self.event_timers_enabled_led.on()
                    await asyncio.sleep_ms(50)
            else:
                self.event_timers_enabled_led.off()
                await asyncio.sleep_ms(50)
            
    async def pollToggleTimerButtonState(self):
        while True:
            button_val = self.toggle_timer_button.value()
            if button_val != self.previous_toggle_timer_button_val:
                if button_val == 0:
                    self.event_timers_enabled = not self.event_timers_enabled
                    await self.saveEventTimersState()
                self.previous_toggle_timer_button_val = button_val
            await asyncio.sleep_ms(20)
    
    async def saveEventTimersState(self):
        self.event_timers_state.setState(self.event_timers_enabled) #### make task
        self.event_timers_state.write()
        await asyncio.sleep_ms(1)
    
    # Sync the clock with NTP
    async def ntpTimeSync(self):
        while True:
            try:
                if self.mqtt_client.isconnected():
                    print('ntp time sync')
                    ntp_res = _ntptime.time(-7) # ***** adjust for dst *****
                    if ntp_res > 0:
                        t = time.localtime(ntp_res)
                        self.ds3231.set_time(t)
                    await asyncio.sleep(60 * 60 * 12)
                else:
                    await asyncio.sleep(30)
            except Exception as e:
                sys.print_exception(e)
                await asyncio.sleep(30)

    async def pollEventTimers(self):
        while True:
            YY, MM, dd, hh, mm, ss, dow, _ = self.ds3231.get_time()
            current_time = datetime(YY, MM, dd, hh, mm, ss)
            print(current_time)
            if not self.event_timers_enabled:
                await asyncio.sleep(1)
                continue
            try:
                self.active_event_timer = self.event_timers.get(
                    YY=YY,
                    MM=MM,
                    dd=dd,
                    hh=hh,
                    mm=mm,
                    ss=ss,
                    dow=dow
                )
                if self.active_event_timer:
                    print('self.active_event_timer', self.active_event_timer.__dict__)
                    self.last_active_event_timer = self.active_event_timer
                    event_timer_datetime = datetime(
                        YY,
                        MM,
                        dd,
                        self.active_event_timer.hh,
                        self.active_event_timer.mm,
                        self.active_event_timer.ss
                    )
                    d = timedelta(minutes=self.active_event_timer.duration)
                    self.turn_off_at = event_timer_datetime + d
                    await self.toggleRelay(self.active_event_timer.relay_id, 'on')
                await asyncio.sleep(1)
            except Exception as e:
                sys.print_exception(e)
                await asyncio.sleep(5)
    
    async def pollEndEventTimers(self):
        while True:
            if not self.event_timers_enabled:
                await asyncio.sleep(1)
                continue
            try:
                YY, MM, dd, hh, mm, ss, dow, _ = self.ds3231.get_time()
                current_time = datetime(YY, MM, dd, hh, mm, ss)
                if self.turn_off_at and self.last_active_event_timer:
                    # Check to make sure event timer has not been deleted while running
                    existing_event_timer = self.event_timers.getById(self.last_active_event_timer._id)
                    if current_time > self.turn_off_at and existing_event_timer:
                        await self.toggleRelay(self.last_active_event_timer.relay_id, 'off')
                        self.last_active_event_timer = None
                        self.turn_off_at = None
                await asyncio.sleep(1)
            except Exception as e:
                sys.print_exception(e)
                await asyncio.sleep(5)
            
    async def cancelActiveEventTimer(self): ################# ?
        if self.active_event_timer:
            print('cancelActiveEventTimer', self.active_event_timer)

            self.event_timers_enabled = False
            self.turn_off_at = None
            self.last_active_event_timer = None
            await self.saveEventTimersState()
    
    def addEventTimer(self, event_timer):
        try:
            self.event_timers.read()
            _id = self.event_timers.add(
                relay_id=str(event_timer['relay_id']),
                dow=str(event_timer['dow']),
                hh=event_timer['hh'],
                mm=event_timer['mm'],
                ss=0,
                duration=event_timer['duration']
            )
            self.event_timers.write()
            return _id
        except Exception as e:
            sys.print_exception(e)
    
    def editEventTimer(self, event_timer):
        try:
            self.event_timers.read()
            self.event_timers.edit(
                _id=event_timer['_id'],
                relay_id=str(event_timer['relay_id']),
                dow=str(event_timer['dow']),
                hh=event_timer['hh'],
                mm=event_timer['mm'],
                ss=0,
                duration=event_timer['duration']
            )
            self.event_timers.write()
        except Exception as e:
            sys.print_exception(e)
            
    def deleteEventTimer(self, event_timer_id):
        try:
            self.event_timers.read()
            self.event_timers.remove(event_timer_id) # make this async... ?
            self.event_timers.write()
        except Exception as e:
            sys.print_exception(e)
        
    def cleanup(self):
        for r in self.relays:
            self.relays[r].value(1)
        self.wifi_led.off()
        self.mqtt_led.off()
        #self.exception_led.off()
        self.event_timers_enabled_led.off()
        

