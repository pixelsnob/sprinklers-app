
import onChange from '../lib/onchange.js';

const template = document.createElement('template');

template.innerHTML = `
    <div class="container">
        <label for="ampm">AM/PM</label>
        <select name="ampm" id="ampm">
            <option value="">Select AM or PM...</option>
            <option value="am">AM</option>
            <option value="pm">PM</option>
        </select>
    </div>    
`;

export default class AmPmInput extends HTMLElement {
    
    static formAssociated = true;
    
    constructor() {
        super();
        
        this._internals = this.attachInternals();
        this._value = '';
        
        this.$select = null;
        
        this.props = onChange({
            ampm: ''
        }, this.update.bind(this));
        
        this.attachShadow({ mode: 'open' });
    }
    
    connectedCallback() {
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.$select = this.shadowRoot.querySelector('select');
        this.$select.addEventListener('change', ev => {
            this.value = this.$select.options[ev.target.selectedIndex].value;
        });
        this.value = this.props.ampm;
        this.render();
    }
    
    update(path, current, previous) {
        this.value = current;
        this.render();
    }
    
    render() {
        const $opts = this.$select.querySelectorAll('options');
        Array.from($opts).forEach($opt => {
            if (this.props.ampm === $opt.value) {
                $opt.checked = true;
            }
        });
    }
    
    validate() {
        if (this._value === '') {
            this._internals.setValidity({ valueMissing: true }, 'Select AM or PM', this.$select);
            console.log('invalid')
        } else {
            this._internals.setValidity({});
            console.log('valid')
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

customElements.define('am-pm-input', AmPmInput);





