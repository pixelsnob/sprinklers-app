
import onChange from '../lib/onchange.js';

const template = document.createElement('template');
template.innerHTML = `
    <style>
        :host {
            display: inline;
        }
    </style>
    <div class="datetime-container">
    
    </div>
`;


export default class Datetime extends HTMLElement {

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
                
            }
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
        const $container = this.shadowRoot.querySelector('.datetime-container');
        const dt = new Date(
            this.props.datetime.YY,
            this.props.datetime.MM - 1,
            this.props.datetime.dd,
            this.props.datetime.hh,
            this.props.datetime.mm
        );
        const datetime_am_pm = dt.toLocaleString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });
        $container.innerText = datetime_am_pm;
    }
}

customElements.define('date-time', Datetime);


