var postcss = require('postcss');
var fs = require('fs');
var coloroverlay = require('..');

var options = {
  sign: 'add'
};

var css = fs.readFileSync('main.css', 'utf8');

var processeedCss = postcss(coloroverlay(options)).process(css).css;

fs.writeFile('dist.css', processeedCss, function (err) {
  if (err) {
    throw err;
  }
  console.log('color overlay file written.');
});
