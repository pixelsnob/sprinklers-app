
import onChange from '../lib/onchange.js';

const template = document.createElement('template');

template.innerHTML = `
    <div class="container">
       <label for="relay_id">Relay</label>
       <select name="relay_id" id="relay_id">
           
       </select>
    </div>    
`;

export default class RelayInput extends HTMLElement {
    
    static formAssociated = true;
    
    static get observedAttributes() {
        return [ 'relay_count' ];
    }

    constructor() {
        super();
        
        this._internals = this.attachInternals();
        this._value = '';
        
        this.props = onChange({
            relay_id: ''
        }, this.update.bind(this));
        
        this.attachShadow({ mode: 'open' });
    }
    
    get relay_count() {
       return this.getAttribute('relay_count'); 
    }
    
    set relay_count(value) {
       this.setAttribute('relay_count', value); 
    }
    
    connectedCallback() {
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.$select = this.shadowRoot.querySelector('select');
        this.$select.addEventListener('change', ev => {
            this.value = this.$select.options[ev.target.selectedIndex].value;            
        });
        this.render();
        this.validate();
    }
    
    update(path, current, previous) {
        if (path == 'relay_id') {
            this.value = current;
            this.render();
        }
    }
    
    render() {
        this.$select.innerHTML = '<option value="">Select relay...</option>';
        for (let r = 1; r <= Number(this.relay_count); r++) {
            const $option = document.createElement('option');
            $option.value = r;
            $option.innerText = r;
            $option.selected = (r == Number(this.props.relay_id) ? 'selected': '');
            this.$select.appendChild($option);
        }   
    }
    
    validate() {
        if (!this._value.length) {
            this._internals.setValidity({ valueMissing: true }, 'Select a relay', this.$select);
        } else {
            this._internals.setValidity({});
        }
    }
    
    get value() {
        return this._value;
    }
    
    set value(value) {
        this._value = value;
        this._internals.setFormValue(this._value);
        this.validate();
    }    
        
    // The following properties and methods aren't strictly required,
    // but browser-level form controls provide them. Providing them helps
    // ensure consistency with browser-provided controls.
    
    get form() { return this._internals.form; }
    get name() { return this.getAttribute('name'); }
    get type() { return this.localName; }
    get validity() {return this._internals.validity; }
    get validationMessage() {return this._internals.validationMessage; }
    get willValidate() {return this._internals.willValidate; }

    checkValidity() { return this._internals.checkValidity(); }
    reportValidity() { return this._internals.reportValidity(); }
      
}

customElements.define('relay-input', RelayInput);


