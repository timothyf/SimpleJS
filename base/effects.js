// Depends on common.js

/*
 * Effects object
 * 
 * This object implements several common visual effects.  The effects implemented
 * are the following:
 *   - fade
 *   - blind up
 *   - blind down
 * 
 * Using Fade effect:
 * You can fade an image by using the Effects.fade method as shown below:
 * 		Effects.fade('fade_this', 1000);
 * The first parameter passed is the id of the image that you want to fade.
 * The second parameter passed is the duration of the effect.
 * 
 * 
 * Using Blinds Effects:
 * The following example would execute the blind up effect on a div element with the
 * id value of 'my_div'.  The effect will be applied on the width of the div and will
 * assume a starting width of 100px.  The div will be reduced down to 0 pixels.
 * 
 *		Effects.blind_up({'mode' : 'width', 
 *						  'id' : 'my_div', 
 *						  'end' : 0, 
 *						  'interval' : 10});
 * 
 * Blind effects are available for width, height, and opacity.
 * 
 */
function Effects(){
	
}
/*
Effects.opacity = function(id, opacity_start, opacity_end, duration) {
	//speed for each frame
	var speed = Math.round(duration / 100);
	var timer = 0;

	//determine the direction for the blending, if start and end are the same nothing happens
	if(opacity_start > opacity_end) {
		for(i = opacity_start; i >= opacity_end; i--) {
			setTimeout("Effects.change_opacity(" + i + ",'" + id + "')",(timer * speed));
			timer++;
		}
	} 
	else if(opacity_start < opacity_end) {
		for(i = opacity_start; i <= opacity_end; i++){
			setTimeout("Effects.change_opacity(" + i + ",'" + id + "')",(timer * speed));
			timer++;
		}
	}
}*/

//change the opacity for different browsers
Effects.change_opacity = function(opacity, id) {
	var object = document.getElementById(id).style; 
	object.opacity = (opacity / 100);
	object.MozOpacity = (opacity / 100);
	object.KhtmlOpacity = (opacity / 100);
	object.filter = "alpha(opacity=" + opacity + ")";
}
/*
Effects.blend_image = function(div_id, image_id, image_file, duration) {
	var speed = Math.round(duration / 100);
	var timer = 0;
	
	//set the current image as background
	document.getElementById(div_id).style.backgroundImage = "url(" + document.getElementById(image_id).src + ")";
	
	//make image transparent
	Effects.changeOpac(0, image_id);
	
	//make new image
	document.getElementById(image_id).src = image_file;

	//fade in image
	for(i = 0; i <= 100; i++) {
		setTimeout("Effects.changeOpac(" + i + ",'" + image_id + "')",(timer * speed));
		timer++;
	}
}*/
/*
Effects.fade_to = function(id, end_opacity, duration) {
	//standard opacity is 100
	var current_opacity = 100;
	
	if(document.getElementById(id).style.opacity < 100) {
		current_opacity = document.getElementById(id).style.opacity * 100;
	}
	Effects.opacity(id, current_opacity, end_opacity, duration)
}

//if an element is invisible, make it visible, else make it ivisible
Effects.fade = function(id, duration) {
	if(document.getElementById(id).style.opacity == 0) {
		this.opacity(id, 0, 100, duration);
	} 
	else {
		this.opacity(id, 100, 0, duration);
	}
};*/

Effects.fade = function(config) {
	if ($(config.id).style.display === 'none') {
		Effects.blind_down({
			'mode': 'opacity',
			'id': config.id,
			'start': 0,
			'end': 100,
			'interval': config.interval
		});
	}
	else {
		Effects.blind_up({
			'mode': 'opacity',
			'id': config.id,
			'start': 100,
			'end': 0,
			'interval': config.interval
		});
	}
}

Effects.blind_up = function(config) {
	$(config.id).style.display = '';
	var toggle = new BlindToggle(config);
	toggle.blindUp();
};

Effects.blind_down = function(config) {
	$(config.id).style.display = '';
	var toggle = new BlindToggle(config);
	toggle.blindDown();
};


function BlindToggle(config) {
	this.obj = $(config.id);
	this.mode = config.mode;
	if (this.mode != 'opacity') {
		this.start = parseInt(this.obj.style[this.mode]);
	}
	else {
		this.start = config.start;
	}
	this.end = config.end;
	this.max = this.start > this.end ? this.start : this.end;
	this.skipfactor = config.skip_factor || 80;
	this.current = this.start;
	this.interval = config.interval || 20;
	this.to = null;
	
	this.toggle_blind = function() {
		if (this.start > this.end) {
			this.skipfactor = -this.skipfactor;
		}
		clearTimeout(this.to);
		this.resize();
	};
	
	this.blindUp = function() {
		this.skipfactor = -this.skipfactor;
		clearTimeout(this.to);
		this.resize();
	};
	
	this.blindDown = function() {
		clearTimeout(this.to);
		this.resize();
	};
}

BlindToggle.prototype.resize = function() {
	this.skip = Math.round(this.max / this.skipfactor);
	if (this.mode != 'opacity') {
		this.current = parseInt(this.obj.style[this.mode]);
	}
	if ((this.skipfactor < 0 && (this.current + this.skip) > this.end) || 
	    (this.skipfactor > 0 && (this.current + this.skip) < this.end)) {
		if (this.mode == 'opacity') {
			Effects.change_opacity(this.current += this.skip, this.obj.id);
		}
		else {
			this.obj.style[this.mode] = val_px((this.current + this.skip));
		}		
		this.to = setTimeout(function(ajax_object){
								return function(){
									ajax_object.resize();
								};
							  }(this), this.interval);
	}
	else {
		if (this.mode != 'opacity') {
			this.obj.style[this.mode] = val_px(((this.skipfactor < 0) ? this.end : this.end));
		}
		this.obj.style.display = (this.skipfactor < 0 && this.end === 0) ? 'none':'';
	}
};


