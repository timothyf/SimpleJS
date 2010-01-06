// Depends on common.js

/*
 * Spinner class
 * 
 * Implements a spinner control for picking a value.
 * 
 * Usage:
 * 		In your DOM you should specify a DIV element to hold your spinner, like this:
 * 		<div id="test_spinner" class="spinner_widget" value="20" interval="1" 
 *			 max_value="30" min_value="1" style="width: 55px;"></div>
 *
 *		The attributes are defined as follows:
 *			id 			= should be a unique id string
 *			class 		= should always be "spinner_widget"
 *			value 		= the default or starting value of the spinner
 *			interval 	= the amount the value will change when up or down is clicked
 *			max_value 	= the maximum value of the spinner
 *			min_value 	= the minimum value of the spinner
 *  
 * 		You should do this on page load to display the spinner:
 * 		var spinner = Spinner('test_spinner');
 * 		spinner.init();
 * 
 * 		The form input element will have an id and name value of "_input" appended to the
 * 		id value of the DIV you used in your DOM. So in the above example, the input
 * 		element would have an id and name of "test_spinner_input".
 */

function Spinner(spinner_id){
	
	this.spinner_id = spinner_id;
	this.continue_spin = false;
	this.interval = parseFloat($(this.spinner_id).interval) || 1;
	this.max_value = parseFloat($(this.spinner_id).max_value) || 1000;;
	this.min_value = parseFloat($(this.spinner_id).min_value) || 0;;

	this.init = function() {
		var input_el = this.create_input_element();
		$(this.spinner_id).appendChild(input_el);		
		
		var spinner_btn_div = create_element('div');
		spinner_btn_div.className = 'spinner_btns';
		$(this.spinner_id).appendChild(spinner_btn_div);
		
		var up_arrow_btn_div = create_element('div');
		up_arrow_btn_div.className = 'up_arrow';
		up_arrow_btn_div.setAttribute('id', this.spinner_id + '_up_arrow');
		spinner_btn_div.appendChild(up_arrow_btn_div);
		
		var up_arrow = create_text_node('▲');
		up_arrow_btn_div.style.fontSize = '6pt';
		up_arrow_btn_div.appendChild(up_arrow);
		
		var dn_arrow_btn_div = create_element('div');
		dn_arrow_btn_div.className = 'down_arrow';
		dn_arrow_btn_div.setAttribute('id', this.spinner_id + '_down_arrow');
		dn_arrow_btn_div.style.fontSize = '6pt';
		spinner_btn_div.appendChild(dn_arrow_btn_div);
		
		var down_arrow = create_text_node('▼');
		dn_arrow_btn_div.appendChild(down_arrow);
		
		$(this.spinner_id).style.display = 'block';
		
		this.add_listeners();
	}
	
	this.create_input_element = function() {
		var input_el = create_element('input');
		input_el.setAttribute('type', 'text');
		input_el.className = 'spinner_input';
		input_el.setAttribute('id', this.spinner_id + '_input');
		input_el.name = this.spinner_id;
		input_el.value = $(this.spinner_id).getAttribute('value');
		input_el.readOnly = 'true';
		var spinner_width = $(this.spinner_id).style.width;
		input_el.style.width = parseInt(spinner_width) - 20;
		return input_el;	
	}
	
	this.add_listeners = function() {
		add_listener($(this.spinner_id + '_up_arrow'), 'mousedown', 
					 (function(spinner){
						return function(){start_spin(1, spinner);};})(this));
		
		add_listener($(this.spinner_id + '_up_arrow'), 'mouseup', 
					 (function(spinner){
						return function(){stop_spin(spinner);};})(this));
		
		add_listener($(this.spinner_id + '_down_arrow'), 'mousedown', 
					 (function(spinner){
						return function(){start_spin(0, spinner);};})(this));
		
		add_listener($(this.spinner_id + '_down_arrow'), 'mouseup', 
					 (function(spinner){
						return function(){stop_spin(spinner);};})(this));
	}
	
	function start_spin(mode, spinner) {
		spinner.continue_spin = true;
		spin_value(mode, spinner);
	}
	
	function stop_spin(spinner) {
		spinner.continue_spin = false;
	}

	
	/// Spins field to next value and sets timer for another spin
	function spin_value(mode, spinner) { //mode:1=up, 0=down
		if (!spinner.continue_spin) {
			return;
		}
		//get current value
		var spinValue = parseFloat($(spinner.spinner_id + '_input').value);
		
		//set next value to target field
		spinValue = (mode == 0) ? spinValue - spinner.interval : spinValue + spinner.interval;
		
		if (spinValue > spinner.max_value) {
			spinValue = spinner.max_value;
		}
		
		if (spinValue < spinner.min_value) {
			spinValue = spinner.min_value;
		}
		$(spinner.spinner_id + '_input').value = spinValue;
		
		//continue spinning		
		setTimeout((function(mode, spinner){
			return function(){
				spin_value(mode, spinner);
			};
		})(mode, spinner), 200)
	}
}

