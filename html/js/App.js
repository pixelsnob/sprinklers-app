
import onChange from './lib/onchange.js';
import EventTimers from './components/EventTimers.js';
import RelaysList from './components/RelaysList.js';
import Datetime from './components/Datetime.js';

const template = document.createElement('template');
template.innerHTML = `
    <style>
        
    </style>
    <div id="app-container">
        <div>Controller Time: <date-time></date-time></div>
        <relays-list></relays-list>
        <event-timers></event-timers>
    </div>
`;

export default class App {
    
    constructor() {
        this.state = onChange({
            relays: {},
            event_timers_enabled: false,
            event_timers: [],
            datetime: {
                'YY': '',
                'MM': '',
                'dd': '',
                'hh': '',
                'mm': '',
                'ss': '',
                'dow': ''
            }
        }, this.update.bind(this));
        
        this.$el = template.content.cloneNode(true);
        this.$relays_list = this.$el.querySelector('relays-list');
        this.$event_timers = this.$el.querySelector('event-timers');
        this.$app_container = this.$el.querySelector('#app-container');
        
        this.$datetime = this.$el.querySelector('date-time');

        // Catch events that bubble up from child components
        
        this.$app_container.addEventListener('toggle', ev => {
            this.onRelayToggle(ev.detail.relay_id);
        });
        this.$app_container.addEventListener('toggle_event_timers', ev => {
            this.onEventTimersToggle();
        });        
        this.$app_container.addEventListener('update_event_timer', ev => {
            this.onEventTimerUpdate(ev.detail.event_timer);
        });
        this.$app_container.addEventListener('delete_event_timer', ev => {
            this.onEventTimerDelete(ev.detail.event_timer_id);
        });
        this.$app_container.addEventListener('add_event_timer', ev => {
            this.onEventTimerAdd(ev.detail.event_timer, ev.detail.uid);
        });
    }
    
    onRelayToggle(relay_id) {
        
    }
    
    onEventTimersToggle() {
        
    }
    
    onEventTimerUpdate(event_timer) {
        
    }
    
    onEventTimerDelete(event_timer_id) {
        
    }
    
    onEventTimerAdd(event_timer, uid) {
        
    }
    
    update(path, current, previous) {
        this.$relays_list.props.relays = Object.assign({}, this.state.relays); ///////////
        this.$datetime.props.datetime = this.state.datetime;
        this.$event_timers.props.event_timers_enabled = this.state.event_timers_enabled;
        this.$event_timers.props.event_timers = this.state.event_timers;
        this.$event_timers.props.event_timer_changed = this.state.event_timer_changed;
        this.$event_timers.props.active_event_timer = this.state.active_event_timer;
    }
}

