
import onChange from '../lib/onchange.js';

const template = document.createElement('template');

template.innerHTML = `
    <div class="container">
        <label for="duration">Duration (minutes)</label>
        <select name="duration" id="duration">
           
        </select>
    </div>    
`;

export default class DurationInput extends HTMLElement {
    
    static formAssociated = true;
    
    static get observedAttributes() {
        
    }

    constructor() {
        super();
        
        this._internals = this.attachInternals();
        this._value = '';
        
        this.props = onChange({
            duration: ''
        }, this.update.bind(this));
        
        this.attachShadow({ mode: 'open' });
    }
    
    connectedCallback() {
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.$select = this.shadowRoot.querySelector('select');
        this.$select.addEventListener('change', ev => {
            this._value = this.$select.options[ev.target.selectedIndex].value;
            this._internals.setFormValue(this._value);
            this.validate();
            
        });
        this.validate();
        this.render();
        
    }
    
    update(path, current, previous) {
        this._value = current;
        this._internals.setFormValue(this._value);
        this.validate();
        this.render();
        
    }
    
    render() {
        this.$select.innerHTML = '<option value="">Select duration...</option>';
        for (let i = 0.5; i <= 59;) {
            const $option = document.createElement('option');
            $option.value = i;
            $option.innerText = i;
            $option.selected = i === this.props.duration ? true: '';
            this.$select.appendChild($option);
            i = i < 5 ? i + 0.5 : i + 1;
        }   
    }
    
    validate() {
        if (this._value === '') {
            this._internals.setValidity({ valueMissing: true }, 'Select the duration', this.$select);
        } else {
            this._internals.setValidity({});
        }
    }
    
    get value() {
        return this._value;
    }
    
    set value(value) { this._value = value; }
    
        
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

customElements.define('duration-input', DurationInput);






