# clipcart.js

There is a common pattern when you explore data visualization with many different data objects - it's hard to remember
details about what you've found. You have to do some kind of notes and that's annoing. After some combination of 
filters/searches/interactions how could you save interesting "data points", or interesting records from results what you've obtained?

What's it, clipcart.js is a very simple class which you could add to your (d3-based) dataviz. The name is a mix of clipboard and 
e-commerce cart, for obvious reasons. 

To use it,  you need to provide only CSS class name of elements you want to save later in this. 
Unsofisticated e-cart/clipboard inspired class to copy and save interesting data points from d3.js based visualizations


var clp = new Clipcart('#clipboard');  // create Clipcart, add div with an id of "clipboard"
...
// create somethere in you code set of elements with a CSS class "poi", for example
// after that, do:
clp.add_nodes(".poi"); // now data embedded in such element of interest will be added to our Clipcart object if you click on it

After exploring datavis (and hopefully collecting some interesting points), you could download them in CSV file by clicking on #clipboard 
div on your page 


API
...todo
