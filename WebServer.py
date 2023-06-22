import sys
import uasyncio
from nanoweb import Nanoweb, send_file
import json

BASE_DIR = './html'

class WebServer:
        
    def __init__(self, app):
        self.app = app
        self.server = Nanoweb()

        # Declare route from a dict
        self.server.routes = {
            '/': self.index,
            '/js/*': self.js
        }
        
    async def index(self, request):
        try:
            #status = json.dumps(self.app.buildMqttStatusObject())
            await request.write("HTTP/1.1 200 OK\r\n")
            await request.write("Content-Type: text/html\r\n\r\n")

            await send_file(
                request,
                '%s/index.html' % BASE_DIR
            )
            await uasyncio.sleep_ms(20)
            
        except Exception as e:
            sys.print_exception(e)
    
    async def run(self):
        return await self.server.run()
    
    async def js(self, request):
        try:
            await request.write("HTTP/1.1 200 OK\r\n")
            await request.write("Content-Type: text/javascript\r\n")
            await request.write("Cache-Control: max-age=604800, public, must-revalidate\r\n\r\n")
            await send_file(
                request,
                '%s%s' % (BASE_DIR, request.url)
                #**args,
            )
            await uasyncio.sleep_ms(20)
            
        except Exception as e:
            sys.print_exception(e)


