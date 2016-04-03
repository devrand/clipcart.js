(function(){

// utils 
function flatten(obj) {
  var rez = arguments[1] || {}, name;
  for (name in obj) {
    if (obj.hasOwnProperty(name)) {
      typeof obj[name] === "object" ? flatten(obj[name], rez) : rez[name] = obj[name];
    }
  }
  return rez;
}

// next two function stolen somewhere from SO
function hash(str) {  // we need hash to create an unique index for each datapoint
  var hash = 0, i, chr, len;
  if (str.length === 0) return hash;
  for (i = 0, len = str.length; i < len; i++) {
    chr   = str.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};


function export_csv(rows, header, filename) {
        var processRow = function (row) {
            var finalVal = '';
            for (var j = 0; j < row.length; j++) {

             
                var innerValue = typeof row[j] === 'undefined' || row[j] === null ? '' : row[j].toString();
                if (row[j] instanceof Date) {
                    innerValue = row[j].toLocaleString();
                };
                var result = innerValue.replace(/"/g, '""');
                if (result.search(/("|,|\n)/g) >= 0)
                    result = '"' + result + '"';
                if (j > 0)
                    finalVal += ',';
                finalVal += result;
            }
            return finalVal + '\n';
        };

        var csvFile = '';
        var csv_array = [header.join(',') + "\n"];
        for (var i = 0; i < rows.length; i++) {
            csv_array.push( processRow(rows[i]) );
        }
        csvFile += csv_array.join(''); 
     
        var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
        if (navigator.msSaveBlob) { // IE 10+
            navigator.msSaveBlob(blob, filename);
        } else {
            var link = document.createElement("a");
            if (link.download !== undefined) { // feature detection
                // Browsers that support HTML5 download attribute
                var url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", filename);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    }


// main class
/*
* 
* @clipboard_selector - css selector for Clipboard's node (i.e. #clipboard) 
* @item_selector - css selector for nodes with data we want to copy to Clipboard
* @fields - subset of all keys from data object that we want to save (also they will be a column names in CSV file )  
*/
function Clipboard(clipboard_selector, item_selector, fields){
 // if ( this instanceof Clipboard ) {
  this.sel = clipboard_selector;
	this.data_sel = item_selector;
	this.fields = fields || [] ;

	this.help_window();

  // attach onclick handlers to nodes of interest. nodes could have additional onclick callbacks, becouse we use custom namespace (click.ctrlc)  
  // see i.e. https://github.com/mbostock/d3/wiki/Selections#on
  if(this.data_sel) this.add_nodes(this.data_sel);
  
 // } else 
 //   return new Clipboard(clipboard_selector, item_selector, fields);
}



Clipboard.prototype = {
	data: {}, // keys are (hopefully) unique hashes, values are datapoints
	sel: '', // could be changed to any value
	data_sel: '', // selectors for nodes in DOM to which data is appended
	

	acc: function(datapoint){ // accessor, must return [key, datapoint(flattened and selected data)]
	
		// 1. flatten object
		var flat_obj = flatten(datapoint), rez = {}, fields;
		// 2. if there is no columns specified for Clipboard, take it all
		this.fields = this.fields.length === 0 ? d3.keys(flat_obj) : this.fields;
		// look for each field name in this.fields use it as a key in our flatten object
		this.fields.forEach( function(name){ rez[name] =  typeof flat_obj[name] === 'undefined' ? '' : flat_obj[name]; })
		return [ hash(d3.values(rez).join()), rez]; // create hash from each value in datapoint
	},  

	
	add: function(sel){  // add datapoint to clipboard, change download link
		var data_point = this.acc(d3.select(sel).datum()); //shape data from DOM node (initial node data is an expression inside acc() call)
		key = data_point[0]; 
		data_point = data_point[1];	

	    if(typeof this.data[key] === 'undefined' ) {
	      this.data[key] = data_point;
	      this.change_number();
	      this.download_link();
      
	    }  
	
	},

	download_link: function(){ // generate new download link after each "copy" to our clipboard
		var data = d3.values(this.data).map(function(d){return d3.values(d)}  )		// prepare array of rows for CSV 	

		function prepare_link(data, fields){
			return function(){
				export_csv(data, fields,  document.title + '_'+new Date().toString().replace(/ /g, '_')+'.csv');
        //obj.reset();
			}
		}

		d3.select(this.sel).on("click", prepare_link(data, this.fields) );  		

	},

  add_nodes: function(selector){ // select all nodes with @selector and add click handlers to each (to enable adding data to clipboard) 
      d3.selectAll(selector) 
        .on('click.ctrlc', (function(clipboard){ return function(){ clipboard.add(this)} })(this) )
  },

  // ui methods
	change_number: function(){ // change indicator for number of rows in clipboard 
 		d3.select(this.sel).html(d3.keys(this.data).length);
	},

/*
  reset: function(){
    this.data = {};
    this.change_number();
  },
*/
	help_window: function(){

		var div = d3.select("body").append("div")   
    		.attr("class", "tooltip")               
    		.style("opacity", 0);

		d3.select(this.sel).on("mouseover", function(d) {      
            div.transition()        
                .duration(200)      
                .style("opacity", .9);      
            div.html("<h3>Clipboard</h3> Клікніть на коло, щоб зберегти дані, які вас зацікавили, у csv файл")  
                .style("left", (d3.event.pageX) + "px")     
                .style("top", (d3.event.pageY - 110) + "px");    
            })                  
        .on("mouseout", function(d) {       
            div.transition()        
                .duration(500)      
                .style("opacity", 0);   
        });

	}

};	

// define globally
window.Clipboard = Clipboard;


})();