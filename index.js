var postcss = require('postcss');
var objectAssign = require('object-assign');

var defaultOptions = {
  sign: 'coloroverlay' // 标识符，标识符前的值将会被解析
};

module.exports = postcss.plugin('postcss-color-overlay', function (opts) {
  opts = opts || {};

  opts = objectAssign({}, defaultOptions, opts);

  function calculate (bottom, top) {
    // var exp = /^rgba\(((([0-9]{1})|([1-9]{1}[0-9]{1})|(1[0-9]{2})|(2[0-4]{1}[0-9]{1})|(25[0-5]{1})),\s*){3}(0|1|(0\.[0-9]{1,2}))\)$/;
    var contentExp = /rgba\((.+)\)/;

    // if (exp.test(top) && exp.test(bottom)) {
      var topStr = top.replace(/\s+/g, '').match(contentExp)[1];
      var bottomStr = bottom.replace(/\s+/g, '').match(contentExp)[1];

      var topArr = topStr.split(',');
      var bottomArr = bottomStr.split(',');

      var r, b, g, a, r1, b1, g1, a1, r2, b2, g2, a2;

      r1 = parseFloat(bottomArr[0]);
      g1 = parseFloat(bottomArr[1]);
      b1 = parseFloat(bottomArr[2]);
      a1 = parseFloat(bottomArr[3]);
      r2 = parseFloat(topArr[0]);
      g2 = parseFloat(topArr[1]);
      b2 = parseFloat(topArr[2]);
      a2 = parseFloat(topArr[3]);

      a = a1 + a2 - a1 * a2;
      r = (r1 * a1 + r2 * a2 - r1 * a1 * a2) / a;
      g = (g1 * a1 + g2 * a2 - g1 * a1 * a2) / a;
      b = (b1 * a1 + b2 * a2 - b1 * a1 * a2) / a;

      return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';

    // }

    // return false;
  }

  function formatColor (color) {
    var contentExp = /rgba\((.+)\)/;

    color = color.replace(/\s+/g, '').match(contentExp)[1];

    var colorArr = color.split(',');

    return 'rgba(' +
      Number(colorArr[0]).toFixed(0) + ', ' +
      Number(colorArr[1]).toFixed(0) + ', ' +
      Number(colorArr[2]).toFixed(0) + ', ' +
      Number(Number(colorArr[3]).toFixed(2)) +
      ')';
  }

  // Work with options here

  return function (root, result) {

    // Transform CSS AST here

    root.walkComments(function (comment) {

      if (comment.text === opts.sign) {
        var value = comment.prev().value;

        var exp = /((rgba\(((([0-9]{1})|([1-9]{1}[0-9]{1})|(1[0-9]{2})|(2[0-4]{1}[0-9]{1})|(25[0-5]{1})),\s*){3}(0|1|(0\.[0-9]{1,2}))\))\s*\+\s*)+(rgba\(((([0-9]{1})|([1-9]{1}[0-9]{1})|(1[0-9]{2})|(2[0-4]{1}[0-9]{1})|(25[0-5]{1})),\s*){3}(0|1|(0\.[0-9]{1,2}))\))/g;

        var currentArr = value.match(exp);

        if (currentArr && currentArr.length) {
          currentArr.forEach(function (item) {

            var colorArr = item.replace(/\s+/g, '').split('+');

            var currentColor = colorArr.shift();

            while(colorArr.length) {
              var nextColor = colorArr.shift();

              currentColor = calculate(currentColor, nextColor);
            }


            comment.prev().value = comment.prev().value.replace(item, formatColor(currentColor));
          });
        }


        comment.remove();
      }

    });

  }
})
