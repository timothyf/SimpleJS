
// Shorthand for getting an element by its 'id' value
function $(id) {
	return document.getElementById(id);
}

function create_element(element_name) {
	return document.createElement(element_name);
}

function create_text_node(text) {
	return document.createTextNode(text);
}

function getElementsByClassName(node, classname) {
    var a = [];
    var re = new RegExp('\\b' + classname + '\\b');
    var els = node.getElementsByTagName("*");
    for(var i=0,j=els.length; i<j; i++)
        if(re.test(els[i].className))a.push(els[i]);
    return a;
}

function set_id(element, id) {
	element.setAttribute('id', id);	
}

/*
 * Adds a class to the class attribute of a DOM element.
 */
function add_class_name(element, class_name, may_already_exist) { 
	if (element.className) {
		var array_list = element.className.split(' ');
		// if the new class name may already exist in list
		if (may_already_exist) {
			var class_name_upper = class_name.toUpperCase();
			// find all instances and remove them
			for ( var i = 0; i < array_list.length; i++ ) {
				// if class found
				if ( array_list[i].toUpperCase() == class_name_upper ) {
					array_list.splice(i, 1);
					i--;
				}
			}
		}  
		// add the new class to end of list
		array_list[array_list.length] = class_name;
  
		// assign modified class name attribute
		element.className = array_list.join(' ');
	}
	else {  
		// assign modified class name attribute      
		element.className = class_name;   
	}
	return element;
}

/*
 * Removes a class name from the class attribute of a DOM element.
 */
function remove_class_name(element, class_name) { 
	if (element.className) {
		// the classes are just a space separated list, so first get the list
		var array_list = element.className.split(' ');

		// get uppercase class for comparison purposes
		var class_name_upper = class_name.toUpperCase();

		// find all instances and remove them
		for ( var i = 0; i < array_list.length; i++ ) {
			if ( array_list[i].toUpperCase() == class_name_upper ) {
				array_list.splice(i, 1);
				i--;
			}
		}
		element.className = array_list.join(' ');
	}
}

function remove_children_from_node(node) {
	if(node === undefined || node === null) {
		return;
	}
	var len = node.childNodes.length;
	while (node.hasChildNodes()) {
		node.removeChild(node.firstChild);
	}
}

/*
 * Checks to see if the parent node contains a node of the child_node_type as a child
 */
function contains_child(parent_node, child_node_type) {
	// not yet implemented	
}

// Get the width of the document window
function window_width() {
	if (document.documentElement && (document.documentElement.clientWidth > 0)) {return document.documentElement.clientWidth;}
	else if (window.innerWidth) {return window.innerWidth;}
	else {return document.body.clientWidth;}
}

// Get the height of the document window
function window_height() {
	if (window.innerHeight) {return window.innerHeight;}
	else if (document.documentElement && (document.documentElement.clientHeight > 0)) {return document.documentElement.clientHeight;}
	else {return document.body.clientHeight;}
}

// Returns a string representing a pixel value, useful for CSS style declarations
function val_px(pixels) {
	return pixels + "px";
}

// Returns a "Point" object with '.x' and '.y' properties
function Point(x, y) {
	this.x = x;
	this.y = y;
}

// Returns 'Point' object with '.x' and '.y' offsets of 'obj' relative to page
// or relative to optional 'find_id', if 'find_id' is found as a parent
function get_offset_xy(obj, find_id, point) {
	if (point) { // optional 'point' is re-used when valid; good practice when dragging
		point.x = obj.offsetLeft;
		point.y = obj.offsetTop;
		}
	else {point = new Point(obj.offsetLeft, obj.offsetTop);}
	var parent = obj.offsetParent;
	while (parent !== null) {
		if (find_id && (parent.id == find_id)) break;
		point.x += parent.offsetLeft;
		point.y += parent.offsetTop;
		parent = parent.offsetParent;
		}
	return point;
}

// Moves an object to the coordinates specified
function move_to(obj, x, y) {
	obj.style.left = val_px(x);
	obj.style.top = val_px(y);
}

// Checks to see if a string is empty
function isEmpty(a_string) {
	if (a_string.trim() != '') {
		return false;
	} else {
		return true;
	}
}

// Adds a trim method to the String class
String.prototype.trim = function(){
	return this.replace(/^\s+|\s+$/g, "");
}

// check for valid numeric strings
function isNumeric(a_string) {
	var strValidChars = "0123456789";
	var strChar;
	var blnResult = true;

	if (a_string.length == 0)
		return false;

	// test a_string consists of valid characters listed above
	for (i = 0; i < a_string.length && blnResult == true; i++) {
		strChar = a_string.charAt(i);
		if (strValidChars.indexOf(strChar) == -1) {
			blnResult = false;
		}
	}
	return blnResult;
}

// check for valid alphanumeric strings
function isAlphaNumeric(a_string) {
	var strValidChars = "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
	var strChar;
	var blnResult = true;

	if (a_string.length == 0)
		return false;

	// test a_string consists of valid characters listed above
	for (i = 0; i < a_string.length && blnResult == true; i++) {
		strChar = a_string.charAt(i);
		if (strValidChars.indexOf(strChar) == -1) {
			blnResult = false;
		}
	}
	return blnResult;
}

// Checks to see if a string is less than a maximum length specified
function isLessMaxLen(a_string, max_len) {
	if (a_string.length <= max_len) {
		return true;
	} else {
		return false;
	}
}

//Checks to see if a string is more than a minimum length specified
function isMoreMinLen(a_string, min_len) {
	if (a_string.length >= min_len) {
		return true;
	} else {
		return false;
	}
}

//Checks to see if the number is in the range.
function isRange(a_num, min, max){
	if (a_num < min || a_num > max) {
		return false;
	}else{
		return true;
	}	
}

//Return selected value
function get_selected_value(e){
    var x = $(e);
    return x.options[x.selectedIndex].value;
}

//Return input value
function get_input_value(e){
    return $(e).value;
}

function set_input_value(e,value){
	$(e).value = value;
}

//Return checked value
function is_value_checked(e){
    var x = $(e);
    return x.checked;
}

//Return selected radio value 
function get_selected_radio_value(values){
	var result;
	for (var i = 0; i < values.length; i++) {
		if (values[i].checked) {
			result = values[i].value
		}
	}
	return result;
}

//Validate the input value , if it is empty then highlight the label.
function is_empty_input(e){
    var s = $(e).value;
    if (s.trim() != '') {
		if ($(e + '_lbl')) {
			if ($(e + '_lbl').style.color = 'red') {
				$(e + '_lbl').style.color = '#CCCCCC';
			}
		}
        return false;
    }
    else {
		if ($(e + '_lbl')) {
			$(e + '_lbl').style.color = 'red';
		}
        return true;
    }
}

//check whether the one of the radio group buttons is selected
function isRadioSelected(service_form_id, element_name){
    var radio_choice = false;
	var form = document.getElementById(service_form_id);
    for (var i = 0; i < form.elements.length; i++) {
        var element = form.elements[i];
        if (element.type == 'radio' && element.name == element_name) {
            if (element.checked) 
                radio_choice = true;
        }
    }
    if (!radio_choice) {
        return false;
    }
    return true;
}

//Return selected radio value 
function getRadioSelectedValue(service_form_id, element_name){
	var result;
	var form = document.getElementById(service_form_id);
	
    for (var i = 0; i < form.elements.length; i++) {
        var element = form.elements[i];
        if (element.type == 'radio' && element.name == element_name) {
            if (element.checked) 
                result = element.value;
        }
    }
	return result;
}

// Builds POST parameters for the form specified
function build_form_data(form){
	this.form = typeof form == 'string' ? document.forms[form] : form;
	
	var parameters = [];
	for(var i = 0; i < this.form.elements.length; i++){
		var element = this.form.elements[i];
		//for now i am adding radio,checkbox(not control item),text and hidden
		//later we can add type = select, type = textarea or checkbox control items
		if((element.type == 'radio' || element.type == 'checkbox') && element.checked){
			parameters.push(element.name + '=' + element.value);					
		}
		if(element.type == 'select-one'){
			parameters.push(element.name + '=' + element.options[element.selectedIndex].value);
		}
		if(element.type == 'text' || element.type == 'hidden'){
			parameters.push(element.name + '=' + element.value);					
		}
	}
	parameters = parameters.join('&');
	return parameters;
}
	  