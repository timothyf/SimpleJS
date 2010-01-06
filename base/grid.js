/*
 * Grid class for implementing Grid component functionality.
 * 
 * Supported features:
 * 		sort by column
 * 		scrollable content
 * 		custom cell renderers
 * 		row selection, single or multi
 * 		editable cells
 * 		load content via Ajax
 * 		event callbacks for various grid events
 * 		grid styles abstracted to style sheet grid.css
 * 		multiple grids on a single page
 * 
 * usage:
 * 		In your DOM you should specify a DIV element to hold your grid, like this:
 * 		<div class="grid" id="test_grid" style="width:380px;height:150px;display:none;"></div>
 * 
 * 		To show the grid, you would use the following JavaScript
 *     	var grid = new Grid('test_grid');
 *      grid.init(grid_header, grid_data, GridSelectionModel.MULTI);
 *     
 *     The grid_header and grid_data values are specified as JSON data.  The third
 *     parameter specifies the selection type for the grid.  This can be either single,
 *     or multi-select.  You would pass either of these values for the selection type:
 *         GridSelectionModel.SINGLE
 *         GridSelectionModel.MULTI
 *         GridSelectionModel.NONE
 *     If GridSelectionModel.NONE is used, grid rows can not be selected.  If you have a
 *     selection mode enabled, there are methods available to retrieve all of the selected
 *     rows, so that you can process the selections.  Individual methods are documented in
 *     the code below.
 *         
 *     Here are examples header and data values:
 *     
 *     	var grid_header = [
 *			{ 
 *				label: 'Company',
 *				width: '100px'},
 *			{
 *				label: 'City',
 *				width: '100px',
 *				renderer: render_city},
 *			{
 *				label: 'Rank',
 *				width: '50px',
 *				editable: true}];
 *
 *     var grid_data = [['GM', 'Detroit', '1'], 
 *				        ['Ford', 'Dearborn', '2'], 
 *				        ['Chrysler', 'Auburn Hills', '3'], 
 *				        ['Toyota', 'Tokyo', '4']];
 *
 *		In the column definition for the city column, you notice a renderer being 
 *		specified.  The grid allows you to specify a custom renderer for any column.
 *		If you wanted to display all of the city names in bold text, you could implement
 *		the render_city method like this:
 *			function render_city(data) {
 *				return '<b>' + data + '</b>';
 *			}
 * 
 * 		Loading via Ajax:
 * 		You can also load the grid via an Ajax request.  Sample code that loads a grid
 * 		via Ajax is below:
 *				var grid_2 = new Grid('test_grid_2');
 *				grid_2.selection_type = GridSelectionModel.SINGLE;
 *				grid_2.grid_header = my_grid_header;
 *				grid_2.load('home/load_grid_data');
 * 
 * 		Editable Cells:
 * 		Notice the 'Rank' column definition above has a property of 'editable' set to true.
 * 		If a column is set as editable, the user can edit values contained in that column 
 * 		by double-clicking a cell within that column.
 * 
 * 		Events:
 * 		You can specify the following event handlers for a grid:
 * 			on_select_row(rowIndex)
 * 			on_deselect_row(rowIndex)
 * 			on_start_edit(rowIndex, colIndex)
 * 			on_data_change(rowIndex, colIndex)
 *	
 *	TO-DO:
 *		add support for complex cell edit types, select lists, checkboxes, etc. 
 *		add support for column resizing (requires dragging)
 *		add support for images in cells
 *		add support for row checkboxes
 *		add support for paging of data
 *			 - client-side paging (client has all data)
 *			 - server-side paging (client has one page of data at a time)
 *			 - paging controls in footer
 *		add support for remote sorting
 *		add support for button toolbar in footer
 */
function Grid(grid_id){

	this.grid_id = grid_id;
	this.grid_header = [];
	this.data_store = null;
	this.selected_rows = [];
	this.selection_type = GridSelectionModel.SINGLE;
	this.sort_order = SJSDataStore.SortOrder.ASCEND;
	
	this.config = {
		remote_sort: false,
		paging: 'client',
		page_size: 10
	};
	
	/*
	 * This method should be called to initialize and display the grid.
	 */
	this.init = function(grid_header, grid_data, selection_type, default_sort_col) {
		this.data_store = new SJSDataStore();
		this.grid_header = grid_header.clone();
		this.data_store.init(grid_data);
		this.selection_type = selection_type || GridSelectionModel.SINGLE;
		var bldr = new GridBuilder().build(this);
	 	if (default_sort_col) {
			this.sort(default_sort_col, this.sort_order);
		}
		this.deselect_all();
		// setup onchange listener for data store to redisplay grid whenever the
		// data in the data store changes.
		this.data_store.onchange = function(myobj){
						return function(){
							return myobj.redisplay();
						}}(this);	
	};	
	
	/*
	 * Sample config:
	 * 		{ grid_header : header_data,
	 * 		  grid_data	 : data,
	 * 		  selection_type : GridSelectionModel.SINGLE,
	 * 		  sort_col : 1,
	 * 		  sort_order : SJSDataStore.SortOrder.ASCEND,
	 * 		  url: url_to_load_grid_data_from }
	 */
	this.init2 = function(config) {
		this.data_store = new SJSDataStore();
		this.grid_header = config.grid_header.clone();
		if (config.grid_data) {
			// use grid data supplied
			this.data_store.init(config.grid_data);
		}
		else {
			// load from url
			this.data_store.onload = function(myobj){
							return function(){
								return myobj.redisplay();
							}}(this);		
			this.data_store.load(config.url);
		}
		this.selection_type = config.selection_type || GridSelectionModel.SINGLE;
		var bldr = new GridBuilder().build(this);
	 	if (config.sort_col) {
			this.sort(config.sort_col, this.sort_order);
		}
		this.deselect_all();
		// setup onchange listener for data store to redisplay grid whenever the
		// data in the data store changes.
		this.data_store.onchange = function(myobj){
						return function(){
							return myobj.redisplay();
						}}(this);	
	};
	
	/*
	 * This method is used to load the grid with data retrieved from the server
	 * using an Ajax request.
	 */
	this.load = function(url) {	
		this.data_store = new SJSDataStore();
		this.data_store.onload = function(myobj){
						return function(){
							return myobj.redisplay();
						}}(this);		
		this.data_store.load(url);
	};
	
	this.row_id = function(row) {
		return $(this.grid_id).id + '_grid_row_' + row;
	};
	
	this.cell_id = function(row, col) {
		return $(this.grid_id).id + '_grid_cell_' + row + '_' + col	
	};
	
	this.header_cell_id = function(col) {
		return $(this.grid_id).id + '_header_cell_' + col;	
	};
	
	/*
	 * This method is used to destroy an existing grid.  This removes the
	 * grid completely from the DOM tree.
	 */
	this.destroy = function() {
		this.destroy_grid();
		this.data_store = null;
	};
	
	this.destroy_grid = function() {
		remove_children_from_node($(this.grid_id));
	};
	
	/*
	 * Returns a value for a specific grid cell.
	 */
	this.get_value = function(row, col) {
		return this.data_store.get_value(row, col);
	};
	
	/*
	 * Sets a cell value in the grid
	 */
	this.set_value = function(row, col, value) {
		this.data_store.set_value(row, col, value);
	}
	
	/*
	 * Responds to a doubleclick event on a cell.
	 */
	this.handle_double_click = function(row, col) {
		if (this.grid_header[col].editable) {
			this.start_edit(row, col);
		}
		
		var elements = getElementsByClassName($(this.grid_id), 'cell_edit_field');
		for (var i = 0; i < elements.length; i++) {
			elements[i].onblur = (function(myobj){
				return function(){myobj.save_edits();}})(this);
		}
	};
	
	/*
	 * Puts a cell into edit mode by converting the cell contents into an
	 * input text field.
	 */
	this.start_edit = function(row, col) {
		// make sure cell is not already in edit mode		
		if ($(this.cell_id(row, col)).innerHTML.indexOf('<INPUT') === -1) {		
			var input_el = create_element('input');
			input_el.style.width = this.grid_header[col].width;
			add_class_name(input_el, 'cell_edit_field');
			input_el.type = 'text';
			input_el.value = $(this.cell_id(row, col)).innerHTML;
			
			remove_children_from_node($(this.cell_id(row, col)));
			$(this.cell_id(row, col)).appendChild(input_el);
					
			if (this.on_start_edit) this.on_start_edit(row, col);
		}
	};
	
	/*
	 * Converts all the edit fields back into static text fields
	 * Saves changed data back to grid_data array
	 */
	this.save_edits = function() {
		var elements = getElementsByClassName($(this.grid_id), 'cell_edit_field');
		// step through each edit field
		for (var i=0; i < elements.length; i++) {
			var re = new RegExp("(grid_cell_)(\\d*)_(\\d*)");
			var res = re.exec(elements[i].parentNode.id);
			var row = res[2];
			var col = res[3];
			this.data_store.set_value(row, col, elements[i].value);
			elements[i].parentNode.innerHTML = elements[i].value;
			if (this.on_data_change) this.on_data_change(row, col);
		}
	};
	
	/*
	 * Removes the specified row number from the grid.   The data is also removed
	 * from the grid_data array.
	 */
	this.remove_row = function(row_num) {
		this.deselect_row(row_num);
		this.data_store.remove(row_num);
	};
	
	/*
	 * Adds a new row to the grid and then redisplays the grid to include the new row.
	 */
	this.add_row = function(new_row) {
		this.data_store.insert(new_row);
	};
	
	this.row_count = function() {
		if (this.data_store)
			return this.data_store.count();
		else {
			return 0;
		}
	}
	
	/*
	 * Removes all selected rows from the grid.   The data is also removed
	 * from the grid_data array.
	 */
	this.remove_selected_rows = function() {
		var selected_rows_copy = this.selected_rows.clone();
		for (var i=0; i < selected_rows_copy.length; i++) {
			this.remove_row(selected_rows_copy[i]);
		}
	};
	
	/*
	 * Sorts the grid based on the column number parameter.
	 */
	this.sort = function(column_num) {
		this.sort_order = this.sort_order === SJSDataStore.SortOrder.ASCEND ? SJSDataStore.SortOrder.DESCEND : SJSDataStore.SortOrder.ASCEND;
		this.data_store.sort(column_num, this.sort_order);		
		if (this.data_store.get_sort_order() === SJSDataStore.SortOrder.ASCEND) {
			add_class_name($(this.header_cell_id(column_num)), 'sort_up', true);
		}
		else {
			add_class_name($(this.header_cell_id(column_num)), 'sort_down', true);
		}
	};
	
	this.filter = function(col, filter_text) {
		return this.data_store.filter(col, filter_text);
	};
	
	this.redisplay = function() {
		var data = this.data_store.data.clone();
		this.destroy();
		this.init(this.grid_header, data, this.selection_type);	
		//this.destroy_grid();
		//var bldr = new GridBuilder().build(this);
	};
	
	this.row_click = function(row_num) {
		if (this.selection_type != GridSelectionModel.NONE) {
			if (!this.is_row_selected(row_num)) {
				this.select_row(row_num);
			}
			else {
				this.deselect_row(row_num);
			}
		}
	}
	
	this.select_row = function(row_num) {
		if (this.selection_type === GridSelectionModel.SINGLE) {
			this.deselect_all();
		}
		this.selected_rows[this.selected_rows.length] = row_num;		
		add_class_name($(this.row_id(row_num)), 'row_selected');		
		if (this.on_select_row) this.on_select_row(row_num);
	}
	
	this.deselect_row = function(row_num) {
		for(var i=0; i < this.selected_rows.length; i++) {
			if(this.selected_rows[i] === row_num)
				this.selected_rows.remove(i, i);
		}	
		remove_class_name($(this.row_id(row_num)), 'row_selected');		
		if (this.on_deselect_row) this.on_deselect_row(row_num);
	}
	
	this.get_selected_rows = function() {
		return this.selected_rows;
	}
	
	this.is_row_selected = function(row_num) {
		if (this.selected_rows.contains(row_num)) {
			return true;	
		}
		return false;
	}
	
	this.select_all = function() {
		for (var i=0; i < this.data_store.count(); i++) {
			this.select_row(i);	
		}
	}
	
	this.deselect_all = function() {
		for (var i=0; i < this.data_store.count(); i++) {
			this.deselect_row(i);	
		}
	}
};


/*
 * This class is used to build the Grid DOM 
 */
function GridBuilder() {
	
	this.build = function(grid) {
		$(grid.grid_id).appendChild(build_header(grid));
		$(grid.grid_id).appendChild(build_content(grid));
		$(grid.grid_id).appendChild(build_footer(grid));
		$(grid.grid_id).style.display = 'block';	
	};

	function build_header(that) {
		var grid_hdr_el = create_element('div')
		add_class_name(grid_hdr_el, "grid_header");
		
		var grid_tbl_el = create_table("grid_row_table");
		grid_tbl_el.style.width = '100%';
		grid_hdr_el.appendChild(grid_tbl_el);
		
		var grid_row_el = grid_tbl_el.insertRow(0);
		grid_row_el.setAttribute('border', "1px");
		
		for (var i = 0; i < that.grid_header.length; i++) {
			var grid_td_el = grid_row_el.insertCell(i);
			add_class_name(grid_td_el, "grid_row_cell");
			add_class_name(grid_td_el, "grid_row_cell_header");
			grid_td_el.style.width = that.grid_header[i].width;
			
			var link_el = create_element('div');
			set_id(link_el, that.header_cell_id(i));
			
			link_el.onclick = (function(col, myobj){
				return function(){myobj.sort(col);}})(i, that);
			
			link_el.appendChild(text_node(that.grid_header[i].label));
			grid_td_el.appendChild(link_el);
		}
		return grid_hdr_el;
	};
	
	function build_content(that){
		var grid_cnt_el = create_element('div');
		add_class_name(grid_cnt_el, "grid_content");
		grid_cnt_el.style.height = $(that.grid_id).style.height;
		
		// add in scroll box here
		var scroll_box_el = create_element('div');
		add_class_name(scroll_box_el, "scroll_box");
		
		scroll_box_el.style.height = $(that.grid_id).style.height;
		
		grid_cnt_el.appendChild(scroll_box_el);
		for (var i = 0; i < that.data_store.count(); i++) {
			var grid_row = build_grid_row(i, that);
			scroll_box_el.appendChild(grid_row);
		}
		return grid_cnt_el;
	}
	
	function build_footer(that) {
		var footer_el = create_element('div');
		add_class_name(footer_el, "grid_footer");
		set_id(footer_el, $(that.grid_id).id + "_footer");
		
		// build page indicator
		
		// build paging controls
		
		// build button toolbar
		
		return footer_el;
	}
	
	function build_grid_row(row_num, that){
		var row_data = that.data_store.get_row(row_num);
		var grid_row = create_element('div');
		add_class_name(grid_row, "grid_row");
		set_id(grid_row, $(that.grid_id).id + '_grid_row_root_' + row_num);
		
		var grid_tbl_el = create_table("grid_row_table");
		grid_tbl_el.style.width = $(that.grid_id).style.width;
		
		grid_row.appendChild(grid_tbl_el);
		
		var grid_row_el = grid_tbl_el.insertRow(0);
		
		grid_row_el.onmouseover = function(){
			if (!that.is_row_selected(row_num)) {
				add_class_name(this, 'row_hover');
			}
		};
		grid_row_el.onmouseout = function(){
			remove_class_name(this, 'row_hover');
		};
		
		set_id(grid_row_el, that.row_id(row_num))
		
		grid_row_el.onclick = function() {
			that.row_click(row_num);
		};
		
		for (var i = 0; i < that.grid_header.length; i++) {
			var grid_td_el = grid_row_el.insertCell(i);
			add_class_name(grid_td_el, "grid_row_cell");
			grid_td_el.style.width = that.grid_header[i].width;
			set_id(grid_td_el, that.cell_id(row_num, i));
			
			grid_td_el.ondblclick = function(){
				that.handle_double_click(row_num, i);
			};
			
			grid_td_el.ondblclick = (function(row, col){
				return function(){that.handle_double_click(row, col);}})(row_num, i);
			
			if (that.grid_header[i].renderer == null) {
				grid_td_el.appendChild(text_node(row_data[i]));
			}
			else {
				grid_td_el.innerHTML = that.grid_header[i].renderer(row_data[i]);
			}
		}		
		return grid_row;
	}
	
	function text_node(text) {
		return create_text_node(text);
	}
	
	function create_table(class_name) {
		var grid_tbl_el = create_element('table');
		add_class_name(grid_tbl_el, class_name);
		grid_tbl_el.setAttribute('cellpadding', "3px");
		grid_tbl_el.setAttribute('cellspacing', "3px");
		return grid_tbl_el;
	}	
};


function GridSelectionModel() {
	this.selection_type = GridSelectionModel.SINGLE;
};

GridSelectionModel.SINGLE = "SINGLE";
GridSelectionModel.MULTI = "MULTI";
GridSelectionModel.NONE = "NONE";


/*
 * This object provides an implementation of a data store which is used by the grid
 * to encapsulate the data displayed in the grid.  You can attach event handlers to
 * the data store in order to be notified when certain events take place related to 
 * the data store.  Here are the events which you can attach listeners to:
 * 		onload - called when a load completes successfully
 * 		onchange - called when any data in the grid is changed
 */
function SJSDataStore() {
	
	this.data = [];
	this.sort_col = 0;

	this.sort_order = SJSDataStore.SortOrder.ASCEND;
	
	
	this.init = function(some_data) {
		this.data = some_data.clone();
	};
	
	this.insert = function(new_row) {
		this.data.push(new_row);
		if (this.onchange) {this.onchange();}
	};
	
	this.remove = function(index) {
		this.data.remove(index, index);
		if (this.onchange) {this.onchange();}
	};
	
	this.count = function() {
		return this.data.length;
	};
	
	this.get_row = function(row) {
		return this.data[row];	
	};
	
	this.get_value = function(row, col) {
		return this.data[row][col];
	};
	
	this.set_value = function(row, col, value) {
		this.data[row][col] = value;
		if (this.onchange) {this.onchange();}
	};
	
	this.toggle_sort_order = function() {
		if (this.sort_order = SJSDataStore.SortOrder.ASCEND) {
			this.sort_order = SJSDataStore.SortOrder.DESCEND;
		}
		else {
			this.sort_order = SJSDataStore.SortOrder.ASCEND;
		}
	};
	
	this.filter = function(col, filter_text) {
		var results = [];
		for (var i=0; i < this.count(); i++) {
			if (this.get_value(i, col).indexOf(filter_text) != -1) {
				// filter text found in data, so add to results array
				results.push(this.get_row(i));
			}
		}
		return results;
	};
	
	this.get_sort_order = function() {
		return this.sort_order;
	}
	
	this.sort = function(column_num, sort_order) {
		this.sort_col = column_num;
		this.sort_order = sort_order; //this.sort_order === SJSDataStore.SortOrder.ASCEND ? SJSDataStore.SortOrder.DESCEND : SJSDataStore.SortOrder.ASCEND
		this.data.sort(
			function(myobj){
				return function(a, b){
							return myobj.sort_by_col(myobj.sort_col, myobj.sort_order, a, b);
						}
			}(this)
		);	
		if (this.onchange) {this.onchange();}	
	};
	
	this.sort_by_col = function(sort_col, sort_order, a, b) {
		if (isNaN(parseInt(a[sort_col]))) {
			var x = a[sort_col];
			var y = b[sort_col];	
		}
		else {
			var x = parseInt(a[sort_col]);
			var y = parseInt(b[sort_col]);
		}
		var val = ((x < y) ? (sort_order)*-1 : ((x > y) ? (sort_order)*1 : 0));
		return parseInt(val);
	};
	
	/*
	 * This method is used to load the grid with data retrieved from the server
	 * using an Ajax request.
	 */
	this.load = function(url) {
		var ajax = new Ajax();
		ajax.send_get(url, 
					 true,
					 function(myobj){
						return function(response){
							return myobj.data_load(response);
						}
					 }(this),
					 function(myobj){
						return function(response){
							return myobj.data_failure(response);
						}
					 }(this)	
	)};
	
	this.data_load = function(response) {
		this.init(eval(response));
		if (this.onload) {this.onload();}
	};
	
	this.data_failure = function(response) {
		// failed to load data
	};
};

SJSDataStore.SortOrder = {
		ASCEND: 1,
		DESCEND: -1
};

