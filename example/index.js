var postcss = require('postcss');
var fs = require('fs');
var coloroverlay = require('..');

var options = {
  disabled: false, // 是否禁用插件
  divide: true, // 是否需要分隔符
  include: [], // 包含在运算范围内的css属性
  exclude: [] // 不包含在运算范围内的css属性（优先级高于include）
};

var css = fs.readFileSync('main.css', 'utf8');

var processeedCss = postcss(coloroverlay(options)).process(css).css;

fs.writeFile('dist.css', processeedCss, function (err) {
  if (err) {
    throw err;
  }
  console.log('done.');
});
