
import onChange from '../lib/onchange.js';
import Button from './ToggleButton.js';

export default class RelaysListItem extends HTMLElement {
    
    constructor() {
        super();
        this.props = onChange({
            relay_id: null,
            is_on: false
        }, this.update.bind(this));
        
        this.$button = null;
    }
    
    connectedCallback() {
        this.render();
        this.setButtonProps();
    }
    
    buttonOnclick(ev) {
        const toggle_event = new CustomEvent('toggle', {
            bubbles: true,
            composed: true,
            detail: { relay_id: this.props.relay_id }
        });
        this.dispatchEvent(toggle_event);
    }
    
    update(path, current, previous) {
        this.setButtonProps();
    }
    
    setButtonProps() {
        if (this.$button) {
            this.$button.props.enabled = this.props.is_on;
            this.$button.props.label = `Relay ${this.props.relay_id}`;
        }
    }
    
    render() {
        this.$button = document.createElement('toggle-button');
        this.$button.buttonClickedCallback = this.buttonOnclick.bind(this);
        
        this.appendChild(this.$button);
        this.className = 'relay-' + this.props.relay_id;
    }
}

customElements.define('relays-list-item', RelaysListItem);
