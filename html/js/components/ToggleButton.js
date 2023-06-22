
import onChange from '../lib/onchange.js';

const template = document.createElement('template');
template.innerHTML = `
    <style>
        :host {
            display: block;
            margin-bottom: 12px;
        }
        button {
            font-size: 20px;
            font-style: 'bold';
            padding: 3px 5px;
            color: white;
            background: gray;
        }
        button[enabled="0"] {
            background: red;
        }
        button[enabled="1"] {
            background: green;
        }
    </style>
    <button type="button" class="toggle-button"></button>
`;


export default class ToggleButton extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        
        this.props = onChange({
            enabled: false,
            label: '',
            enabled_true_label: 'ON',
            enabled_false_label: 'OFF'
        }, this.update.bind(this));
    }
    
    connectedCallback() {
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.$button = this.shadowRoot.querySelector('button');
        this.$button.onclick = this.buttonOnclick.bind(this);
        
        if (this.getAttribute('label')) {
            this.props.label = this.getAttribute('label');
        }
        this.render();
    }
    
    buttonOnclick(ev) {
        if (typeof this.buttonClickedCallback == 'function') {
            this.buttonClickedCallback();
        }
    }
    
    update(path, current, previous) {
        this.render();
    }
    
    render() {
        if (this.props.enabled) {
            this.$button.setAttribute('enabled', '1');
            this.$button.innerText = `${this.props.label}: ${this.props.enabled_true_label}`;
        } else {
            this.$button.setAttribute('enabled', '0');
            this.$button.innerText = `${this.props.label}: ${this.props.enabled_false_label}`;

        }
    }
}

customElements.define('toggle-button', ToggleButton);

