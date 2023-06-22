
import RelaysListItem from './RelaysListItem.js';
import onChange from '../lib/onchange.js';

export default class RelaysList extends HTMLElement {
    
    constructor() {
        super();
        this.props = onChange({ relays: {} }, this.update.bind(this));        
    }
    
    connectedCallback() {
        this.render();
    }
    
    update(path, current, previous) {
        if (this.isConnected) {
            this.render();
        }
    }
    
    render() {
        for (let r in this.props.relays) {
            let $existing_element = this.querySelector('relays-list-item.relay-' + r);
            if ($existing_element) {
                $existing_element.props.is_on = this.props.relays[r] == 'on';
            } else {
                let $relays_list_item = document.createElement('relays-list-item');
                $relays_list_item.props.relay_id = r;
                $relays_list_item.props.is_on = this.props.relays[r] == 'on';
                this.appendChild($relays_list_item);
            }
        }
    }
}

customElements.define('relays-list', RelaysList);
