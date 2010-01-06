// Depends on common.js and event.js

/*
 * DialogBox class implements dialog box component.
 * 
 * Usage:
 * 		var dlg_box = new DialogBox(true);
 * 		dlg_box.show();
 * 
 * To hide the dialog, use the hide() method like this:
 * 		dlg_box.hide(true);
 * 
 * For the boolean parameter to hide(), the following applies:
 * Pass true if you want the call_ok handler to be called, and false if you 
 * want the call_cancel handler to be called.
 * 
 */
DialogBox = function(isModal, use_titlebar) {
	if (arguments.length == 0) return;
	this.isModal = isModal;
	
	this.build = function() {
		this.container = document.createElement('div');
		this.container.className = DialogBox.className;
		var rnd_num = Math.floor(Math.random()*100000);
		this.container.setAttribute('id', 'dialog_box_' + rnd_num);
		this.dlg_id = 'dialog_box_' + rnd_num;
		this.container.dialog_box = this;

		var main_table = document.createElement('table');
		main_table.setAttribute('cellSpacing', '0');
		main_table.setAttribute('cellPadding', '0');
		main_table.setAttribute('border', '0');
	
		var tBodyM = document.createElement('tbody');
		var rowM = document.createElement('tr');
		var cellM = document.createElement('td');

		if (use_titlebar) {
			var title_bar = this.build_title_bar();
			cellM.appendChild(title_bar);
		}
		rowM.appendChild(cellM);
		tBodyM.appendChild(rowM);
	
		rowM = document.createElement('tr');
		cellM = document.createElement('td');
		cellM.className = "main_panel";
	
		this.content_area = document.createElement('div');
		this.content_area.className = "content_area";
		cellM.appendChild(this.content_area);

		rowM.appendChild(cellM);
		tBodyM.appendChild(rowM);
		main_table.appendChild(tBodyM);
		this.container.appendChild(main_table);
		BodyZ.to_top(this.container);
	};
	
	// Builds the dialog title bar
	this.build_title_bar = function() {
		var title_bar = document.createElement('table');
		title_bar.setAttribute('cellSpacing', '0');
		title_bar.setAttribute('cellPadding', '0');
		title_bar.setAttribute('border', '0');
		title_bar.setAttribute('width', '100%');
	
		var tBodyT = document.createElement('tbody');
		var rowT = document.createElement('tr');
		var cellT = document.createElement('td');
		cellT.className = "tb_left";
		rowT.appendChild(cellT);
	
		this.titleCell = document.createElement('td');
		this.titleCell.className = "title";
		rowT.appendChild(this.titleCell);
	
		cellT = document.createElement('td');
		cellT.className = "tb_right";
	
		DialogBox.init_close_icon();
		var close_icon = document.createElement('img');
		close_icon.src = DialogBox.close_icon.src;
		close_icon.setAttribute('border','0');
		close_icon.dialog_box = this;
	
		var a_link = document.createElement('A');
		a_link.setAttribute('href','#');
		a_link.appendChild(close_icon);
		a_link.onclick = DialogBox.close_box;
	
		cellT.appendChild(a_link);
		rowT.appendChild(cellT);	
		tBodyT.appendChild(rowT);
		title_bar.appendChild(tBodyT);	
		return title_bar;
	};
	
	this.build();
}

DialogBox.image_path = "images/"; // directory path to 'window_close.gif' in titleBar

DialogBox.prototype.show = function() {
	this.container.style.display = "block";
	BodyZ.to_top(this.container);
	if (this.isModal) {
		// show the veil if this is a modal dialog
		Veil.show(true);
	}
	this.move_to(-1, -1);	// centers the dlg
}

DialogBox.prototype.hide = function(ok) {
	this.container.style.display = "none";
	if (this.isModal) Veil.show(false);
	if (ok && this.call_ok) {
		// call call_ok handler if defined
		this.returnData ? this.call_ok(this.returnData) : this.call_ok();
	}
	else if (!ok && this.call_cancel) {
		// call call_cancel handler if defined
		this.call_cancel();
	}
}

DialogBox.prototype.move_to = function(x, y) {
	if (x == -1) x = Math.round((document.body.clientWidth - this.container.offsetWidth) / 2);
	if (y == -1) y = Math.round((document.body.clientHeight - this.container.offsetHeight) / 2) + document.body.scrollTop;
	this.container.style.left = x + "px";
	this.container.style.top = y + "px";
}

DialogBox.prototype.set_title = function(title) {
	if (this.titleCell) {
		this.titleCell.innerHTML = title;
	}
}

DialogBox.prototype.set_content = function(htmlContent) {
	this.content_area.innerHTML = htmlContent;
}

DialogBox.prototype.set_width = function(width) {
	this.content_area.style.width = width + "px";
}

DialogBox.prototype.set_call_ok = function(call_ok) {
	this.call_ok = call_ok;
}

DialogBox.prototype.set_call_cancel = function(call_cancel) {
	this.call_cancel = call_cancel;
}

DialogBox.prototype.get_content_node = function() {
	return this.content_area;
}

DialogBox.CLOSE_ICON = "close_icon.gif";

// Private Methods
DialogBox.className = "dialog_box"; // CSS className
DialogBox.close_icon = null;
DialogBox.max_depth = 5; // optimize search of parent nodes

DialogBox.init_close_icon = function() {
	// pre-fetch this icon so it doesn't distort dialog box size
	if (DialogBox.close_icon == null) {
		DialogBox.close_icon = new Image();
		DialogBox.close_icon.src = DialogBox.image_path + DialogBox.CLOSE_ICON;
	}
}

DialogBox.close_box = function(e) {
	if (!e) e = window.event;
	var node = e.target ? e.target : e.srcElement;
	var count = 0;
	while ((node != null) && (count < DialogBox.max_depth)) {
		if (node.dialog_box) {
			node.dialog_box.hide();
			return false;
		}
		node = node.parentNode;
		count++;
	}
	return false;
}

DialogBox.center_the_dlg = function(div_el) {
	var div_pos = get_offset_xy(div_el);
	var newX = div_pos.x;
	var newY = div_pos.y;
	if (div_pos.x + div_el.offsetWidth - document.body.scrollLeft > document.body.clientWidth) newX = document.body.scrollLeft + document.body.clientWidth - div_el.offsetWidth;
	if (div_pos.x < document.body.scrollLeft) newX = document.body.scrollLeft;
	if (div_pos.y + div_el.offsetHeight - document.body.scrollTop > document.body.clientHeight) newY = document.body.scrollTop + document.body.clientHeight - div_el.offsetHeight;
	if (div_pos.y < document.body.scrollTop) newY = document.body.scrollTop;
	if ((newX !== div_pos.x) || (newY !== div_pos.y)) move_to(div_el, newX, newY);
}


/*
 * Manages z-Index Visibility
 * 
 * BodyZ {
 *     que		a 'div' element
 *     last		pointer to last element
 *     nid		sequential node id
 *     next_z	sequential Z level
 *     to_top()	adds element to top of BodyZ.que
 *     set()
 * }
 */
var BodyZ = { 
	to_top: function(elm) {
		if (!BodyZ.que) {
			// if que doesn't yet exist, create it and append to body
			BodyZ.que = document.createElement("div");
			document.body.appendChild(BodyZ.que);
		}
		if (!elm.BodyZZ) {
			elm.BodyZZ = BodyZ.nid++;
			add_listener(elm, "mousedown", function() {
				BodyZ.to_top(elm);
				});
			BodyZ.que.appendChild(elm);
			BodyZ.set(elm);
		}
		else if (elm.BodyZZ != BodyZ.last.BodyZZ) BodyZ.set(elm);
	},

	// Private
	set: function(elm) {
		elm.style.zIndex = BodyZ.next_z++;
		BodyZ.last = elm;
	},
	nid:1,
	next_z:1
}


/*
 * The Veil class is used to obscure the background under a semi-transparent div element
 * 
 * Veil {
 *     css		CSS style for the Veil element
 *     reqs
 *     veil		div element representing the veil
 *     show()	displays the 'veil'
 *     fix()
 *     init()	initializes the Veil object, called once per page
 * }
 */
var Veil = {
	show: function(show_it) {
		Veil.init();
		if (!show_it) {
			Veil.reqs.pop();
		}
		else if (BodyZ.last) {
			Veil.reqs.push(BodyZ.last);
		}
		if (Veil.reqs.length > 0) {
			Veil.fix();
			Veil.veil.style.zIndex = Veil.reqs[Veil.reqs.length-1].style.zIndex-1;
			BodyZ.que.insertBefore(Veil.veil, Veil.reqs[Veil.reqs.length-1]);
		}
		Veil.veil.style.display = (Veil.reqs.length == 0) ? "none" : "block";
	},

	// Private
	fix: function() {
		Veil.veil.style.width = val_px(Math.max(document.body.scrollWidth, window_width()));
		Veil.veil.style.height = val_px(Math.max(document.body.scrollHeight, window_height()));
	},
	init: function() {
		if (typeof Veil.veil == "undefined") {
			Veil.reqs = [];
			Veil.veil = document.createElement('div');
			for (var prop in Veil.css) Veil.veil.style[prop] = Veil.css[prop];
			Veil.veil.innerHTML = "&nbsp;";
			if (BodyZ.que) BodyZ.que.insertBefore(Veil.veil, BodyZ.que.firstChild);
			else BodyZ.to_top(Veil.veil);
			add_listener(window, "resize", Veil.fix);
		}
	},
	css: {position:"absolute", display:"none", top:0, left:0, cursor:"not-allowed", backgroundColor:"#000000", filter:"alpha(opacity=20)", opacity:0.2}
}


