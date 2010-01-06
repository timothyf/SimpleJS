// This file contains extensions to standard JavaScript objects

// Adds a remove method to Array objects
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

// Adds a contains method to Array objects
Array.prototype.contains = function(value) {
	for(var i=0; i < this.length; i++) {
	  if(this[i] === value)
	        return true;
	}
	return false;
};

// Adds a clone method to the Object object
Object.prototype.clone = function () {
	var o = new Object(); 
	for (var property in this) {
		o[property] = typeof (this[property]) == 'object' ? this[property].clone() : this[property]
	} 
	return o
}

// Adds a clone method to the Array object.
Array.prototype.clone = function () {
	var a = new Array(); 
	for (var property in this) {
		a[property] = typeof (this[property]) == 'object' ? this[property].clone() : this[property]
	} 
	return a
}

// Adds a trim method to the String class
String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g,"");
}