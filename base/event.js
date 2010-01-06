function add_listener(obj, event_type, fn) {
	if (obj.addEventListener) {obj.addEventListener(event_type, fn, false);}
	else if (obj.attachEvent) {obj.attachEvent('on' + event_type, fn);}
}

function remove_listener(obj, event_type, fn) {
	if (obj.removeEventListener) {obj.removeEventListener(event_type, fn, false);}
	else if (obj.detachEvent) {obj.detachEvent('on' + event_type, fn);}
}