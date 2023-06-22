
import onChange from '../lib/onchange.js';

const template = document.createElement('template');

template.innerHTML = `
    <div class="container">
        <label for="mm">Minute</label>
        <select name="mm" id="mm">
           
        </select>
    </div>    
`;

export default class MinuteInput extends HTMLElement {
    
    static formAssociated = true;
    
    constructor() {
        super();
        
        this._internals = this.attachInternals();
        this._value = '';
        
        this.props = onChange({
            mm: ''
        }, this.update.bind(this));
        
        this.attachShadow({ mode: 'open' });
    }
    
    connectedCallback() {
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.$select = this.shadowRoot.querySelector('select');
        this.$select.addEventListener('change', ev => {
            this.value = this.$select.options[ev.target.selectedIndex].value;       
        });
        this.value = this.props.mm;
        this.render();
    }
    
    update(path, current, previous) {
        this.value = current;
        this.render();
    }
    
    render() {
        this.$select.innerHTML = '<option value="">Select minute...</option>';
        for (let i = 0; i <= 59; i++) {
            const $option = document.createElement('option');
            $option.value = i;
            $option.innerText = (i < 10 ? `0${i}` : i);
            $option.selected = i === this.props.mm ? true : false;
            this.$select.appendChild($option);
        }   
    }
    
    validate() {
        if (this._value === '') {
            this._internals.setValidity({ valueMissing: true }, 'Select the minute', this.$select);
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

customElements.define('minute-input', MinuteInput);





