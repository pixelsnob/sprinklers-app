
import onChange from '../lib/onchange.js';
import DaysOfWeekInput from './DaysOfWeekInput.js';
import RelayInput from './RelayInput.js';
import HourInput from './HourInput.js';
import MinuteInput from './MinuteInput.js';
import DurationInput from './DurationInput.js';
import uid from '../lib/util.js';

const template = document.createElement('template');
  
template.innerHTML = `
    <form name="event-timer-form">
        <div>
            <relay-input name="relay_id"></relay-input>
        </div>
        <div><a id="use-current-datetime">Use current day and time</a></div>
        <div>
            <days-of-week-input name="dow" tabindex="0"></days-of-week-input>
        </div>
        <div>
            <hour-input name="hh"></hour-input>
        </div>
        <div>
            <minute-input name="mm"></minute-input>
        </div>
        <div>
            <duration-input name="duration"></duration-input>
        </div>
        <input type="submit"></input>
    </form>
`;

export default class EventTimerForm extends HTMLElement {
    
    static get observedAttributes() {
        return [ 'form_action' ];
    }
    
    constructor() {
        super();
                
        this.props = onChange({
            relays: {},
            event_timer: {
                _id: 0,
                relay_id: '',
                duration: '',
                hh: '',
                mm: '',
                dow: ''
            }
        }, this.update.bind(this));
        
        this.attachShadow({ mode: 'open', delegatesFocus: true });
        
        this.$days_of_week_input = null;
    }
    
    get form_action() {
       return this.getAttribute('form_action'); 
    }
    
    set form_action(value) {
       this.setAttribute('form_action', value);
    }
    
    connectedCallback() {
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.$form = this.shadowRoot.querySelector('form');
        this.$days_of_week_input = this.shadowRoot.querySelector('days-of-week-input');
        this.$hour_input = this.shadowRoot.querySelector('hour-input');
        this.$minute_input = this.shadowRoot.querySelector('minute-input');
        this.$relay_input = this.shadowRoot.querySelector('relay-input');
        this.$duration_input = this.shadowRoot.querySelector('duration-input');
        
        this.$relay_input.relay_count = Object.keys(this.props.relays).length;
         
        this.$use_current_datetime = this.shadowRoot.querySelector('#use-current-datetime');
        this.$use_current_datetime.addEventListener('click', ev => {
            const dt = new Date();
            this.$days_of_week_input.props.dow = (dt.getDay() > 0 ? dt.getDay() - 1 : 6).toString();
            this.$hour_input.props.hh = dt.getHours();
            this.$minute_input.props.mm = dt.getMinutes();
        });
        
        this.render();
    }
    
    
    update(path, current, previous) {
        if (path == 'relays' && current) {
            this.$relay_input.relay_count = Object.keys(current).length;
        }
        if (this.form_action == 'edit') {
            this.$days_of_week_input.props.dow = this.props.event_timer.dow;
            this.$relay_input.props.relay_id = this.props.event_timer.relay_id;
            this.$hour_input.props.hh = this.props.event_timer.hh;
            this.$minute_input.props.mm = this.props.event_timer.mm;
            this.$duration_input.props.duration = this.props.event_timer.duration;
        }
        
    }
    
    render() {        
        this.$form.addEventListener('submit', this.onFormSubmit.bind(this));
    }
    
    onFormSubmit(ev) {
        ev.preventDefault();
        try {
            const event_timer = Object.assign({}, this.props.event_timer, {
                dow: this.$form.dow.value,
                relay_id: this.$form.relay_id.value,
                hh: Number(this.$form.hh.value),
                mm: Number(this.$form.mm.value),
                duration: Number(this.$form.duration.value)
            });

            const event_name = this.form_action == 'edit' ? 'update_event_timer' : 'add_event_timer';
            
            const event_timer_event = new CustomEvent(event_name, {
                bubbles: true,
                composed: true,
                detail: { event_timer: event_timer, uid: uid() }
            });
            this.dispatchEvent(event_timer_event);
        } catch (e) {
            console.error(e);
        }            
        return false;
    }
    
    disconnectedCallback() {
        this.$form.removeEventListener('submit', this.onFormSubmit.bind(this));
        this.props = null;
        this.$days_of_week_input = null;
        this.$hour_input = null;
        this.$minute_input = null;
        this.$relay_input = null;
        this.$duration_input = null;
    }
}

customElements.define('event-timer-form', EventTimerForm);

