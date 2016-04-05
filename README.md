# clipcart.js

There is a common pattern when you explore data visualization with many different data objects - it's hard to remember
details about what you've found. After some combination of 
filters/searches/interactions how could you save interesting "data points", or interesting records from results what you've obtained? You have to do some kind of notes and that's annoing. 

What's it, clipcart.js is a very simple class which you could add to your (d3-based) dataviz. The name is a mix of clipboard and e-commerce cart, for obvious reasons. 

# Simplest way to use

You need to provide CSS class name for elements you want to save in Clipcart during your exploration. 
```javascript
var clp = new Clipcart('#clipboard');  // create Clipcart, add div with an id of "clipboard" to a page
...
// somewhere in your code ...
// after creating from your data ( with d3.js) set of elements (with a CSS class "poi", for example)
clp.add_nodes(".poi"); // now data embedded in these elements of interest will be added to  Clipcart object if you click on it
```
Now if you will work with a datavis  (and hopefully collecting some interesting points), you could download them in CSV file by clicking on #clipboard div on your page

[Example](http://texty.org.ua/d/nadra/) (Click on rectangle, click on some areas on map, look at a gray circle at upper left, then click on that circle to download data in CSV)


# More detailed API
...todo
