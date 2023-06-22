import json

class Store:
    
    db = None
    
    def __init__(self, db='default'):
        self.db = './data/' + db
        
    def read(self):
        f = open(self.db, 'a+')
        c = f.read()
        f.close()
        return c
    
    def write(self, contents):
        f = open(self.db, 'w+')
        f.write(contents)
        f.close()