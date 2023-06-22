
import onChange from '../lib/onchange.js';
import Button from './ToggleButton.js';
import EventTimersList from './EventTimersList.js';
import EventTimerForm from './EventTimerForm.js';

const template = document.createElement('template');
template.innerHTML = `
    <div class="button-container">
        <toggle-button label="Event Timers"></toggle-button>
    </div>
    <div class="event-timers-list-container">
        <event-timers-list></event-timers-list>
        <div class="add-event-timer-container">
            <a id="add-event-timer">Add event timer...</a>
        </div>
        <div class="event-timer-form-container"></div>
    </div>
    
`;

export default class EventTimers extends HTMLElement {

    constructor() {
        super();
        this.props = onChange({
            event_timers_enabled: false,
            active_event_timer: null,
            event_timers: [],
            event_timer_added: null,
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
        this.attachShadow({ mode: 'open' });
        this.$button = null;
        this.$event_timer_form = null;
    }
    
    connectedCallback() {
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        
        this.$button = this.shadowRoot.querySelector('toggle-button');
        this.$event_timers_list = this.shadowRoot.querySelector('event-timers-list');
        this.$button.buttonClickedCallback = this.buttonOnclick.bind(this);
        const $add_event_timer_link = this.shadowRoot.querySelector('#add-event-timer');
        
        $add_event_timer_link.addEventListener('click', ev => {
            ev.preventDefault();
            this.renderForm();
            this.$event_timer_form.form_action = 'add';
        });
        
        this.addEventListener('edit_event_timer', ev => {
            ev.preventDefault();
            this.renderForm();
            this.$event_timer_form.form_action = 'edit';
            this.$event_timer_form.props.event_timer = this.props.event_timers.find(et =>
                et._id == ev.detail.event_timer_id
            );
            this.$event_timer_form.props.datetime = this.props.datetime;
        });
        
    }
    
    renderForm() {
        const $container = this.shadowRoot.querySelector('.event-timer-form-container');
        $container.innerHTML = '';
        this.$event_timer_form = document.createElement('event-timer-form');
        $container.appendChild(this.$event_timer_form);
    }
    
    disconnectedCallback() {
        console.log('disconnected');
        
    }
    
    buttonOnclick(ev) {
        const toggle_event = new CustomEvent('toggle_event_timers', {
            bubbles: true
        });
        this.dispatchEvent(toggle_event);
    }
    
    update(path, current, previous) {
        this.$button.props.enabled = this.props.event_timers_enabled;
        this.$event_timers_list.props.event_timers = this.props.event_timers.slice();
        this.$event_timers_list.props.active_event_timer = this.props.active_event_timer;
        this.$event_timers_list.props.event_timers_enabled = this.props.event_timers_enabled;;
        if (this.$event_timer_form && this.$event_timer_form.parentNode && path == 'event_timer_changed' && current != 'deleted') {
            this.$event_timer_form.parentNode.removeChild(this.$event_timer_form);
        }
    }
    
    render() {

    }
}

customElements.define('event-timers', EventTimers);
