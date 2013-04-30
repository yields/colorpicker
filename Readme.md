
# colorpicker

  simple color picker, see the [demo](http://yields.github.io/colorpicker/index.html).

  [![colorpicker](http://f.cl.ly/items/0F142B1S0g0Z44282q3s/Screen%20Shot%202013-04-30%20at%205.13.54%20PM.png)](http://yields.github.io/colorpicker/index.html)

## Installation

    $ component install yields/colorpicker

## Example

```js
var el = document.querySelector('div');
var picker = require('colorpicker')(el);
picker.on('pick', function(){
  console.log(el.style.background); // "rgb(.., .., ..)"
});
```

## License

  MIT
