
def getConfig():
    return {
        'ssid': 'heater',
        'password': 'BsJEuEN5FMGqGTaIC',
        'mqtt_server': '192.168.1.171',
        'client_id': 'picow-spinklers-front',
        #'mqtt_user': b'',
        #'mqtt_password': b'',
        'mqtt_topic': 'sprinklers/front',
        
        # Pin mappings
        'relays': {
            '1': 16,
            '2': 17,
            '3': 18,
            '4': 19,
        },
        'buttons': {
            '1': 0,
            '2': 4,
            '3': 8,
            '4': 12,
        },
        'toggle_timer_button': 26,
        'wifi_led': 'LED',
        'mqtt_led': 20,
        'exception_led': 21,
        'event_timers_enabled_led': 27,
        'ds3231_i2c_scl': 15,
        'ds3231_i2c_sda': 14
        
    }

