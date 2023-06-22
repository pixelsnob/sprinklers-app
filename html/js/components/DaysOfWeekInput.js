
import onChange from '../lib/onchange.js';

const template = document.createElement('template');

const days_of_week = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
];

template.innerHTML = `
    <div class="container">
       
    </div>    
`;

export default class DaysOfWeekInput extends HTMLElement {
    
    static formAssociated = true;
    
    constructor() {
        super();
        
        this._internals = this.attachInternals();
        this._value = '';
        
        this.props = onChange({
            dow: ''
        }, this.update.bind(this));
        
        this.attachShadow({ mode: 'open', delegatesFocus: true });
    }
    
    connectedCallback() {        
        this.render();
        this.validate();
    }
    
    
    update(path, current, previous) {
        if (path == 'dow') {
            this._value = current;
            this._internals.setFormValue(this._value);
            this.render();
            this.validate();
        }
    }
    
    render() {
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        const $container = this.shadowRoot.querySelector('.container');
        $container.innerHTML = '';
        
        days_of_week.map((day, day_index) => {
            const $dow_tpl = document.createElement('template');
            const dow_checked = this.props.dow.split(',').includes(day_index.toString()) ?
                'checked="checked"' : '';
            $dow_tpl.innerHTML = `
                <div class="input-container">
                    <input type="checkbox" name="days-of-week" id="days-of-week-${day_index}"
                        value="${day_index}" ${dow_checked}></input>
                    <label for="days-of-week-${day_index}">${day}</label>
                </div>
            `;
            
            $container.appendChild($dow_tpl.content.cloneNode(true));
            $container.querySelector('input').addEventListener('change', this.onSelectOne.bind(this));
            //console.log('$$$$',  $container.querySelector('input'));
            
        });
        
        this.shadowRoot.querySelectorAll('input[name="days-of-week"]').forEach($el => {
            $el.addEventListener('change', this.onSelectOne.bind(this));
        });
        console.log(this.props.dow.split(',').map(v => Number(v)).every(v => [ 0, 1, 2, 3, 4, 5, 6 ].includes(v)));
        const daily_checked = (this.props.dow == '0,1,2,3,4,5,6' ? 'checked="checked"' : '');  
        
        const $daily_tpl = document.createElement('template');
        $daily_tpl.innerHTML = `
            <div class="input-container">
                <input type="checkbox" name="daily" id="daily" value="" ${daily_checked}></input>
                <label for="daily">Every Day</label>
            </div>
        `;
        
        $container.appendChild($daily_tpl.content.cloneNode(true));
        const $daily_input = this.shadowRoot.querySelector('#daily');
        $daily_input.addEventListener('change', this.onSelectAll.bind(this)); 
    }
    
    onSelectOne(ev) {
        const $dow_inputs = this.shadowRoot.querySelectorAll('input[name="days-of-week"]');
        this.props.dow = Array.from($dow_inputs)
            .filter($el => $el.checked)
            .map($el => $el.value).join(',');
    }
    
    onSelectAll(ev) {
        this.props.dow = ev.target.checked ? '0,1,2,3,4,5,6' : '';
    }
    
    validate() {
        const $container = this.shadowRoot.querySelector('.container');
        const $inputs = $container.querySelectorAll('input[name="days-of-week"]');
        const dow = [];
        $inputs.forEach($input => {
            if ($input.checked) {
                dow.push($input.value);
            }
        });
        this._value = dow.join(',');
        this._internals.setFormValue(this._value);
        
        if (!this._value.length) {
            // Have the form focus on the first checkbox if validation fails
            const $first_checkbox = this.shadowRoot.querySelector('input');
            this._internals.setValidity(
                { valueMissing: true },
                'Choose at least one day of the week',
                $first_checkbox
            );
        } else {
            this._internals.setValidity({});
        }
        
    }
    
    get value() {
        return this._value;
    }
    
    set value(v) { this._value = v; }
    
        
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

customElements.define('days-of-week-input', DaysOfWeekInput);

