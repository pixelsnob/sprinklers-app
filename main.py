
import sys
import traceback
import uasyncio as asyncio
from App import App
from WebServer import WebServer
#from machine import Pin
import logging
import json
from time import sleep

logging.basicConfig(filename='./log/errors.log', format='%(asctime)s %(message)s', level=logging.DEBUG)
#exception_led = Pin(21, mode=Pin.OUT, value=1) # change this
log = logging.getLogger()

def set_global_exception(app):
    def handle_exception(loop, context):
        #exception_led.on()
        sys.print_exception(context['exception'])
        print(context)
        log.critical('Exception! ' + json.dumps(context))
        sleep(2)
        #sys.exit()
    loop = asyncio.get_event_loop()
    loop.set_exception_handler(handle_exception)

app = None

async def main():
    global app
    set_global_exception(app)
    
    app = App()
    web_server = WebServer(app)
    
    loop = asyncio.get_event_loop()

    loop.create_task(app.mqttConnect())
    loop.create_task(app.pollEventTimers())
    loop.create_task(app.pollEndEventTimers())
    loop.create_task(app.eventTimerLed())
    loop.create_task(app.connectionCheck())
    loop.create_task(app.pollRelayButtonsState())
    loop.create_task(app.pollToggleTimerButtonState())
    loop.create_task(app.mqttPublishStatusPeriodically())
    loop.create_task(app.mqttPublishStatusOnStateChange())
    loop.create_task(app.ntpTimeSync())
    loop.create_task(web_server.run())
        
    loop.run_forever()

try:
    asyncio.run(main())
#except Exception as e:
    #print(e)
    
finally:
    asyncio.new_event_loop()  # Clear retained state
    if app:
        app.cleanup()
