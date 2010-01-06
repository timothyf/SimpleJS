// Depends on dialog_box.js, common.js and event.js

/*
 * AppAlert class extends DialogBox
 * 
 * The icon parameter in the constructor specifies an icon to include in the dialog.  
 * The icon value should be one of the following:
 * 		AppAlert.Warning
 * 		AppAlert.Error
 * 		AppAlert.Info 
 * 
 * If you do not want to include an icon, you can pass a null value for the icon parameter.
 * 
 */
AppAlert = function(icon){
	if (arguments.length == 0) {
		return;
	}
	this.base = DialogBox;
	this.base(true, true);
	var dialog_table = document.createElement('table');
	dialog_table.setAttribute('cellSpacing', '0');
	dialog_table.setAttribute('cellPadding', '0');
	dialog_table.setAttribute('border', '0');
	
	var tBody = document.createElement('tbody');
	var row = document.createElement('tr');
	var cell = document.createElement('td');
	cell.setAttribute("vAlign", "top");
	
	if (icon) {
		this.icon_image = document.createElement('img');
		this.icon_image.style.margin = "0px 10px 0px 0px";
		this.set_icon(icon);
		cell.appendChild(this.icon_image);
		row.appendChild(cell);
	}

	this.content_cell = document.createElement('td');
	this.content_cell.className = "content_area";
	row.appendChild(this.content_cell);
	tBody.appendChild(row);
	dialog_table.appendChild(tBody);
	this.content_area.appendChild(dialog_table);

	this.button_div = document.createElement('div');
	this.button_div.setAttribute("align", "center");
	this.button_div.style.margin = "10px 0px 0px 0px";
	this.content_area.appendChild(this.button_div);
}

AppAlert.prototype = new DialogBox();

AppAlert.Warning = "icons/warning.gif"; // 'icon' param to 'AppAlert' constructor
AppAlert.Error = "icons/error.gif";     // 'icon' param to 'AppAlert' constructor
AppAlert.Info = "icons/info.gif";       // 'icon' param to 'AppAlert' constructor
AppAlert.Waiting = "icons/waiting.gif"
AppAlert.lblOK = "OK";
AppAlert.lblCancel = "Cancel";

AppAlert.prototype.set_content = function(htmlContent) {
	this.content_cell.innerHTML = htmlContent;
}

AppAlert.prototype.set_icon = function(icon) {
	this.icon_image.src = DialogBox.image_path + icon;
}


/*
 * ProcessingDlg object - extends AppAlert
 * 
 * Usage:
 * 		var processing_dlg = new ProcessingDlg({
 *									'cancel_handler' : my_cancel_function,
 *									'title' : 'My Title'
 *							   	});
 *		processing_dlg.set_content(msg);
 *		processing_dlg.show();
 *   
 */
ProcessingDlg = function(config) {
	this.base = AppAlert;
	this.base(AppAlert.Waiting);
	this.call_cancel = config.cancel_handler;
	this.set_title(config.title);
	var tmp = new Date();
	var dlg_id = 'processing_cancel_btn' + tmp.getSeconds().toString();
	AppAlert.add_button(this, AppAlert.lblCancel, 2, dlg_id);
	
	this.enable_cancel_btn = function(enable) {
		if (enable === true) {
			$(dlg_id).disabled = '';
		}
		else {
			$(dlg_id).disabled = 'disabled';
		}
	}
}
ProcessingDlg.prototype = new AppAlert();


/*
 * ResultsDlg object - extends AppAlert
 * 
 * Usage:
 * 		var results_dlg = new ResultsDlg({
 *								'icon' : AppAlert.Error,
 								'ok_handler' : my_ok_function,
 								'cancel_handler' : my_cancel_function,
 *								'title' : 'My Title'
 *							   });
 *		results_dlg.set_content(msg);
 *		results_dlg.show();
 *    
 * The icon parameter specifies an icon to include in the dialog.  
 * The icon value should be one of the following:
 * 		AppAlert.Warning
 * 		AppAlert.Error
 * 		AppAlert.Info 
 * 
 * If you do not want to include an icon, you can pass a null value for the icon parameter.
 * 
 */
ResultsDlg = function(config) {
	if (config == null) return;
	this.base = AppAlert;
	this.base(config.icon);
	this.call_ok = config.ok_handler;
	this.call_cancel = config.cancel_handler;
	this.set_title(config.title);
	AppAlert.add_button(this, AppAlert.lblOK, 1);
}
ResultsDlg.prototype = new AppAlert();


/*
 * ConfirmDlg object - extends AppAlert
 * 
 * Usage:
 * 		var confirm_dlg = new ConfirmDlg({
 *								'ok_handler' : my_ok_function,
 								'cancel_handler' : my_cancel_function,
 *								'title' : 'My Title'
 *							   });
 *		confirm_dlg.ask_user(msg);
 *
 */
ConfirmDlg = function(config) {
	if (config == null) return;
	this.base = AppAlert;
	this.base(null);
	this.call_ok = config.ok_handler;
	this.call_cancel = config.cancel_handler;
	this.set_title(config.title);
	AppAlert.add_button(this, AppAlert.lblOK, 1);
	AppAlert.add_button(this, AppAlert.lblCancel, 2);
}
ConfirmDlg.prototype = new AppAlert();

ConfirmDlg.prototype.ask_user = function(html_content) {
	this.set_content(html_content);
	this.show();
}



// Private
AppAlert.add_button = function(parent, button_text, button_num, id) {
	var button = document.createElement("button");
	button.className = "dialog_btn";
	if (id) {
		button.setAttribute('id', id);
	}
	button.innerHTML = button_text;
	button.link_num = button_num;
	button.app_dlg = parent;
	button.onclick = AppAlert.click_link;
	parent.button_div.appendChild(button);
}

AppAlert.click_link = function(e) {
	if (!e) e = window.event;
  	var node = e.target ? e.target : e.srcElement;
  	var link_num = node.link_num;
  	var count = 0;
  	while ((node != null) && (count < DialogBox.max_depth)) {
    	if (node.app_dlg) {
      		switch (link_num) {
        		case 1: {
          			node.app_dlg.hide(true);
          			break;
          		}
        		case 2: {
          			node.app_dlg.hide();
          			break;
          		}
        	}
      		return false;
      	}
    	node = node.parentNode;
    	count++;
	}
  	return false;
}

