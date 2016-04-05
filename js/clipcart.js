(function(){

// utils 
// next three function stolen somewhere from SO

function flatten(obj) { // yes, flatten multi-level object into one-level js hash
  var rez = arguments[1] || {}, name;
  for (name in obj) {
    if (obj.hasOwnProperty(name)) {
      typeof obj[name] === "object" ? flatten(obj[name], rez) : rez[name] = obj[name];
    }
  }
  return rez;
}

// we need some kind of universal uniq id to index each datapoints in clipboard(to avoid doubling the same point etc ). I will use this hash function on all values in data object  
function hash(str) {  
  var hash = 0, i, chr, len;
  if (str.length === 0) return hash;
  for (i = 0, len = str.length; i < len; i++) {
    chr   = str.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

//  "generate" CSV file with Blob object. Don't know about sie limits for a file, though
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
* @clipboard_selector - css selector for Clipcart's node (i.e. #clipboard) 
* @item_selector - css selector for nodes with data we want to copy to Clipcart (your apps specific)
* @fields - subset of all keys from data object that we want to save (they will be a column names in resulting CSV file )  
*/
function Clipcart(clipboard_selector, item_selector, fields){
  this.sel = clipboard_selector;
	this.data_sel = item_selector;
	this.fields = fields || [] ;

  this.clipboard_node();
  if(this.data_sel) this.add_nodes(this.data_sel);

}



Clipcart.prototype = {

	data: {}, // keys are (hopefully) unique hashes, values are datapoints
	sel: '', // could be changed to any value
	data_sel: '', // selectors for nodes in DOM to which data is appended
	

	acc: function(datapoint){ // accessor, must return [key, datapoint(flattened and selected data)]. don't touch this
	
		// 1. flatten object
		var flat_obj = flatten(datapoint), rez = {}, fields;
		// 2. if there is no columns specified for Clipcart, take it all
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
				export_csv(data, fields,  document.title.split(' ').slice(0, 2).join('_') + '_' + 
						new Date().toString().replace(/ /g, '_')+'.csv');
        //obj.reset();
			}
		}

		d3.select(this.sel).on("click", prepare_link(data, this.fields) );  		

	},

	add_nodes: function(selector){ // select all nodes with @selector and add click handlers to each (to enable adding data to clipboard) 
	      this.data_sel = selector;
	      d3.selectAll(selector) 
		.on('click.ctrlc', (function(clipboard){ return function(){ clipboard.add(this)} })(this) )
	},

	  // ui methods

	clipboard_node: function(){
	      d3.select('body')
		.append('div')
		.attr('class', 'clip_circle') // must be same as  in css/clip.css
		.attr('id', this.sel.substr(1)) // remove first "#" in selector
		.text('0');

	      this.help_window();  
	},


	change_number: function(){ // change indicator for number of rows in clipboard    
 		d3.select(this.sel).html(d3.keys(this.data).length);
	},

	help_window: function(){

		var div = d3.select("body").append("div")   
    		.attr("class", "clip_tooltip")               
    		.style("opacity", 0);

		d3.select(this.sel).on("mouseover", function(d) {      
            div.transition()        
                .duration(200)      
                .style("opacity", .9);      
            div.html("<h3>Експорт</h3> Клікніть на це коло, щоб зберегти дані, які вас зацікавили, у CSV файл")  
                .style("left", (d3.event.pageX) - 180 + "px")     
                .style("top", (d3.event.pageY ) + "px");    
            })                  
        .on("mouseout", function(d) {       
            div.transition()        
                .duration(500)      
                .style("opacity", 0); 

            d3.select(this) // show help window only one time ...
              .on("mouseover", null)
              .on("mouseout", null);    
        });

	}

};	

// define globally
window.Clipcart = Clipcart;


})();
