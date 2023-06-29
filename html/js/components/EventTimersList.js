
import onChange from '../lib/onchange.js';

const template = document.createElement('template');
template.innerHTML = `
    <style>
        table {
            display: table;
        }
        .active td {
            background: #ddd;
        }
    </style>
    <table class="event-timers-list" border="1">
        <thead>
            <th>Relay</th>
            <th>Days of Week</th>
            <th>Time</th>
            <th>Duration</th>
            <th></th>
            <th></th>
        </thead>
        <tbody>
            
        </tbody>
    </table>
`;

const DAYS_OF_WEEK = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
];

export default class EventTimersList extends HTMLElement {

    constructor() {
        super();
        this.props = onChange({
            event_timers: [],
            active_event_timer: null,
            event_timers_enabled: false
        }, this.update.bind(this));
        this.attachShadow({ mode: 'open' });
    }
    
    connectedCallback() {
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
    
    update(path, current, previous) {
        this.render();
    }
    
    editOnclick(event_timer_id) {
        const ev = new CustomEvent('edit_event_timer', {
            bubbles: true,
            composed: true,
            detail: { event_timer_id }
        });
        this.dispatchEvent(ev);
    }
    
    deleteOnclick(event_timer_id) {
        const ev = new CustomEvent('delete_event_timer', {
            bubbles: true,
            composed: true,
            detail: { event_timer_id }
        });
        this.dispatchEvent(ev);
    }
    
    render() {
        
        const $tbody = this.shadowRoot.querySelector('tbody');
        $tbody.innerHTML = '';
        if (!this.props.event_timers.length) {
            let $tr = document.createElement('tr');
            let $td = document.createElement('td');
            $td.setAttribute('colspan', 6);
            $td.innerText = 'No event timers found';
            $tr.appendChild($td);
            $tbody.appendChild($tr);
            return null;
        }
        this.props.event_timers.map(event_timer => {
            const $tr = document.createElement('tr');
            $tr.className = this.props.event_timers_enabled &&
                this.props.active_event_timer === event_timer._id ? 'active' : '';
            $tbody.appendChild($tr);
            const tpl = document.createElement('template');
            const dt = new Date();
            dt.setHours(event_timer.hh, event_timer.mm);
            const datetime_am_pm = dt.toLocaleString('en-US', {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true
            });
            tpl.innerHTML = `
                <td>${event_timer.relay_id}</td>
                <td>${event_timer.dow.split(',').map(d => DAYS_OF_WEEK[d]).join(', ')}</td>
                <td>${datetime_am_pm}</td>
                <td>${event_timer.duration}</td>
                <td><a class="edit">Edit</a></td>
                <td><a class="delete">Delete</a></td>
            `;
            $tr.appendChild(tpl.content.cloneNode(true));
            const $edit_a = $tr.querySelector('.edit');
            $edit_a.onclick = this.editOnclick.bind(this, event_timer._id);
            const $delete_a = $tr.querySelector('.delete');
            $delete_a.onclick = this.deleteOnclick.bind(this, event_timer._id);
        });
    }
}

customElements.define('event-timers-list', EventTimersList);

