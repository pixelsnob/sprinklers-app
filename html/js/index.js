
import App from './App.js'

const MQTT_TOPIC = 'sprinklers/front';

const app = new App();
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('main').appendChild(app.$el);
});

const client_name = 'sprinklers-front-web-client-' + Math.floor(Math.random() * 1000 * (new Date).getTime());
const client = new Paho.MQTT.Client('192.168.1.171', 9001, client_name);

client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;

let connected = false;

const connect = function() {
    if (!connected) {
        client.connect({ onSuccess: onConnect });
    }
};

connect();
setInterval(function() {
    connect();
}, 1000);

let timer = null;

function onConnect() {
    connected = true;
    if (timer) {
        clearTimeout(timer);
    }
    client.subscribe(`${MQTT_TOPIC}/#`);
    
    const request_status_message = new Paho.MQTT.Message('1');
    request_status_message.destinationName = `${MQTT_TOPIC}/request_status`;
    request_status_message.qos = 0;
    client.send(request_status_message);
    
    const request_event_timers_message = new Paho.MQTT.Message('1');
    request_event_timers_message.destinationName = `${MQTT_TOPIC}/event_timers/request`;
    request_event_timers_message.qos = 0;
    client.send(request_event_timers_message);   
    

}

function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
        console.log("onConnectionLost:" + responseObject.errorMessage);
        connected = false;
    }
}

function onMessageArrived(message) {
    console.log(message.destinationName, message.payloadString);
    try {
        if (message.destinationName.includes('/status')) {
            let payload = JSON.parse(message.payloadString);
            for (let r in payload.state.relays) {
                app.state.relays[r] = payload.state.relays[r];
            }
            app.state.event_timers_enabled = payload.state.event_timers_enabled;
            app.state.active_event_timer = payload.state.active_event_timer;
            app.state.datetime = payload.datetime;
            app.state.tempf = payload.tempf;
            app.state.tempc = payload.tempc;
        } else if (message.destinationName.includes('/event_timers/list')) {
            let payload = JSON.parse(message.payloadString);
            app.state.event_timers = payload;
        } else if (message.destinationName.includes('/event_timers/changed')) {
            let payload = JSON.parse(message.payloadString);
            app.state.event_timer_changed = payload;
        }
    } catch (e) {
        console.error('onMessageArrived() error', e);
    }
    
}

app.onRelayToggle = function(relay_id) {
    if (!connected) {
        return null;
    }
    const message = new Paho.MQTT.Message('1');
    message.destinationName = `sprinklers/front/channel/${relay_id}/toggle`;
    message.qos = 0;
    client.send(message);
};

app.onEventTimersToggle = function() {
    if (!connected) {
        return null;
    }
    const message = new Paho.MQTT.Message('1');
    message.destinationName = `sprinklers/front/event_timers/toggle`;
    message.qos = 0;
    client.send(message);
};

app.onEventTimerDelete = function(event_timer_id) {
    if (!connected) {
        return null;
    }
    const message = new Paho.MQTT.Message(JSON.stringify({ event_timer_id }));
    message.destinationName = `sprinklers/front/event_timers/delete`;
    message.qos = 0;
    client.send(message);
};

app.onEventTimerUpdate = function(event_timer) {
    if (!connected) {
        return null;
    }
    const message = new Paho.MQTT.Message(JSON.stringify({ event_timer }));
    message.destinationName = `sprinklers/front/event_timers/update`;
    message.qos = 0;
    client.send(message);
};
  
app.onEventTimerAdd = function(event_timer, uid) {
    if (!connected) {
        return null;
    }
    const message = new Paho.MQTT.Message(JSON.stringify({ event_timer, uid }));
    message.destinationName = `sprinklers/front/event_timers/add`;
    message.qos = 0;
    client.send(message);
};

