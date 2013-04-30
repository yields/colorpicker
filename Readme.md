
# colorpicker

  simple color picker.

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
