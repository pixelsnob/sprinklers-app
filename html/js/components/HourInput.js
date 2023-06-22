
import onChange from '../lib/onchange.js';

const template = document.createElement('template');

template.innerHTML = `
    <div class="container">
        <label for="hh">Hour</label>
        <select name="hh" id="hh">
           
        </select>
    </div>    
`;

export default class HourInput extends HTMLElement {
    
    static formAssociated = true;
    
    constructor() {
        super();
        
        this._internals = this.attachInternals();
        this._value = '';
        
        this.props = onChange({
            hh: ''
        }, this.update.bind(this));
        
        this.attachShadow({ mode: 'open' });
    }
    
    connectedCallback() {
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.$select = this.shadowRoot.querySelector('select');
        this.$select.addEventListener('change', ev => {
            this.value = this.$select.options[ev.target.selectedIndex].value;
        });
        this.value = this.props.hh;
        this.render();
    }
    
    update(path, current, previous) {
        this.value = current;
        this.render();
    }
    
    render() {
        this.$select.innerHTML = '<option value="">Select hour...</option>';
        for (let i = 0; i <= 23; i++) {
            const $option = document.createElement('option');
            if (i === 0) {
                $option.innerText = `12 am`;
            } else if (i === 12) {
                $option.innerText = `12 pm`;
            } else if (i > 12) {
                $option.innerText = `${i - 12} pm`;
            } else {
                $option.innerText = `${i} am`;
            }
            $option.value = i;
            $option.selected = i === this.props.hh ? true : false;
            this.$select.appendChild($option);
        }
    }
    
    validate() {
        if (this._value === '') {
            this._internals.setValidity({ valueMissing: true }, 'Select the hour', this.$select);
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

customElements.define('hour-input', HourInput);




