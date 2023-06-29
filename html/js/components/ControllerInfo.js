
import onChange from '../lib/onchange.js';

const template = document.createElement('template');
template.innerHTML = `
    <style>
        /*:host {
            display: inline;
        }*/
    </style>
    <div class="info-container">
        <span class="date-container"></span>
        <span class="time-container"></span><br/>
        <span class="temperature-container"></span><br/>
    </div>
`;


export default class ControllerInfo extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        this.props = onChange({
            datetime: {
                'YY': '',
                'MM': '',
                'dd': '',
                'hh': '',
                'mm': '',
                'ss': '',
                'dow': ''
                
            },
            tempf: '',
            tempc: ''
        }, this.update.bind(this));
    }
    
    connectedCallback() {
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.render();
    }
    
    update(path, current, previous) {
        this.render();
    }
    
    render() {
        const dt = new Date(
            this.props.datetime.YY,
            this.props.datetime.MM,
            this.props.datetime.dd,
            this.props.datetime.hh,
            this.props.datetime.mm
        );
        
        const $date_container = this.shadowRoot.querySelector('.date-container');
        const dt_fmt = dt.toLocaleString('en-US', {
            dateStyle: 'long'
        });
        const dow_fmt = dt.toLocaleString('en-US', {
            weekday: 'long'
        });
        $date_container.innerText = `${dow_fmt}, ${dt_fmt}`;
        
        const $time_container = this.shadowRoot.querySelector('.time-container');
        const time_fmt = dt.toLocaleString('en-US', {
            timeStyle: 'short',
            hour12: true
        });
        $time_container.innerText = time_fmt;
        
        const $temperature_container = this.shadowRoot.querySelector('.temperature-container');
        // Rounds to one place after decimal point
        const tempf = +(Math.round(this.props.tempf + 'e+1')  + 'e-1');
        const tempc = +(Math.round(this.props.tempc + 'e+1')  + 'e-1');
        $temperature_container.innerHTML = `${tempf}&deg;F / ${tempc}&deg;C`;
    }
}

customElements.define('controller-info', ControllerInfo);


