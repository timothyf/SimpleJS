/*
 * Ajax class for implementing AJAX functionality
 * 
 * usage:
 *     var ajax = new Ajax();
 *     ajax.send_get(url, 
 *		    		 is_async, 
 *			    	 success_callback, 
 *				     failure_callback);
 *
 * for a polling request, you would use it like this:
 *     ajax.polling_get(url, 
 *                      is_async, 
 *                      success_callback, 
 *                      failure_callback, 
 *                      period);
 *             
 * and to stop the polling, you would do this:
 *     ajax.stop_polling();
 */
function Ajax() {
	
	this.polling_flag = false;
	this.xhr = false;
	this.attempts = 0;
	try {
		this.xhr = new XMLHttpRequest();
	} 
	catch (failed) {
		this.xhr = false;
	}			
	
	// Private Method
	// sends the XHR request and sets up the response callback function
	this.use_ajax = function(method, 
							 url, 
							 params, 
							 is_async, 
							 success_callback, 
							 failure_callback) {
		try {
			this.success_callback = success_callback;
			this.failure_callback = failure_callback;
			
			// add timestamp to prevent caching
			if (url.indexOf('?') != -1) {
				url += "&timestamp=" + (new Date()).getTime();
			}
			else {
				url += "?timestamp=" + (new Date()).getTime();
			}
			
		  	this.xhr.open(method, url, is_async);
		  	this.xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		  	this.xhr.setRequestHeader("Content-length", params.length);
		  	this.xhr.setRequestHeader("Connection", "close");
			
			this.xhr.onreadystatechange = (function(ajax_obj){
				return function(){
					xhr_callback(ajax_obj);
				}
			})(this);

			//alert('sending ajax');
		  	this.xhr.send(params);
		}
		catch (failure) {
			// exception while trying to send XHR request
			alert('Exception: Call failure');
		} 
	}
	
	// Private Method
	// Handles XHR response callback
	function xhr_callback(ajax_obj) {
		if (ajax_obj.xhr.readyState == 4) {
			if (ajax_obj.xhr.status == 200) {
				eval(ajax_obj.success_callback(ajax_obj.xhr.responseText));
				if (ajax_obj.polling_flag) {	
					ajax_obj.attempts = ajax_obj.attempts + 1;	
					if (ajax_obj.attempts < ajax_obj.max_attempts) {
						setTimeout((function(ajax_object){
							return function(){
								if (ajax_obj.use_get) {
									ajax_obj.send_get(ajax_obj.url, ajax_obj.is_async, ajax_obj.success_callback, ajax_obj.failure_callback);
								}
								else {
									ajax_obj.send_post(ajax_obj.url, ajax_obj.params, ajax_obj.is_async, ajax_obj.success_callback, ajax_obj.failure_callback);
								}
							};
						})(this), ajax_obj.period)
					}
					else {
						ajax_obj.failure_callback();
					}
				}
			}
			else if (ajax_obj.xhr.status == 404) {
				eval(ajax_obj.failure_callback(ajax_obj.xhr.responseText));
			}
			else {
				eval(ajax_obj.failure_callback(ajax_obj.xhr.responseText));
			}
		}
	};
	
	// Sends an Ajax request as an HTTP GET operation
	this.send_get = function(url, is_async, success_callback, failure_callback) {
		this.use_ajax('GET', url, '', is_async, success_callback, failure_callback);
	}
	
	// Sends an Ajax request as an HTTP POST operation
	this.send_post = function(url, 
							  params, 
							  is_async, 
							  success_callback, 
							  failure_callback) {
		this.use_ajax('POST', url, params, is_async, success_callback, failure_callback);
	}
		
	// This method starts an Ajax polling cycle.
	// You pass in the polling frequency using the period parameter.  
	// The period is in milliseconds, so to get 5 seconds, you would use 5000 as the period value.
	// Ajax requests will be sent as GET requests
	this.polling_get = function(url, 
								is_async, 
								success_callback, 
								failure_callback, 
								period,
								max_attempts) {
		this.use_get = true;
		this.url = url;
		this.is_async = is_async;
		this.period = period;
		this.polling_flag = true;
		this.max_attempts = max_attempts || 10;
		this.send_get(url, is_async, success_callback, failure_callback);
	}
	
	// This method starts an Ajax polling cycle.
	// You pass in the polling frequency using the period parameter.  
	// The period is in milliseconds, so to get 5 seconds, you would use 5000 as the period value.
	// Ajax requests will be sent as POST requests
	this.polling_post = function(url, 
								 params, 
								 is_async, 
								 success_callback, 
								 failure_callback, 
								 period,
								 max_attempts) {
		this.use_get = false;
		this.url = url;
		this.params = params;
		this.is_async = is_async;
		this.period = period;
		this.polling_flag = true;
		this.max_attempts = max_attempts || 10;
		this.send_post(url, params, is_async, success_callback, failure_callback);
	}
	
	// if you've started an Ajax Polling method, call this method to stop the polling
	this.stop_polling = function() {
		this.polling_flag = false;
	}
}





