
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

## API

### new Picker(el)

Initialize a new ColorPicker on `el`.

### picker.bind()

bind events.

### picker.freeze(ms)

How much time in `ms` should the picker freeze after a click happened.

### picker.refresh()

The method should be called if `el` height or width changes.

### picker.move(y, x)

Move to `y, x`, this will also change the color.

### picker.color({ hue, sat, lit })

Set the color manually.

### picker.unbind()

Unbind all events.

## License

  MIT
