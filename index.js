var postcss = require('postcss')
var objectAssign = require('object-assign')

var propsList = [
  'background',
  'background-color',
  'border',
  'border-left',
  'border-right',
  'border-top',
  'border-bottom',
  'border-color',
  'border-left-color',
  'border-right-color',
  'border-top-color',
  'border-bottom-color',
  'color',
  'box-shadow',
  '-webkit-box-shadow',
  '-moz-box-shadow'
]

var defaultOptions = {
  disabled: false, // 是否禁用插件
  divide: true,
  include: [], // 包含在运算范围内的css属性
  exclude: [] // 不包含在运算范围内的css属性（优先级高于include）
}

module.exports = postcss.plugin('postcss-color-overlay', function (opts) {
  opts = opts || {}

  opts = objectAssign({}, defaultOptions, opts)

  propsList = propsList.concat(opts.include)

  var calculate = function (bottom, top) {
    var hexadecimalExp = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

    top = hexadecimalExp.test(top) ? hexadecimalToRGBA(top) : top
    bottom = hexadecimalExp.test(bottom) ? hexadecimalToRGBA(bottom) : bottom

    var contentExp = /rgba\((.+)\)/
    var topStr = top.replace(/\s+/g, '').match(contentExp)[1]
    var bottomStr = bottom.replace(/\s+/g, '').match(contentExp)[1]
    var topArr = topStr.split(',')
    var bottomArr = bottomStr.split(',')

    var r, b, g, a, r1, b1, g1, a1, r2, b2, g2, a2

    r1 = parseFloat(bottomArr[0])
    g1 = parseFloat(bottomArr[1])
    b1 = parseFloat(bottomArr[2])
    a1 = parseFloat(bottomArr[3])
    r2 = parseFloat(topArr[0])
    g2 = parseFloat(topArr[1])
    b2 = parseFloat(topArr[2])
    a2 = parseFloat(topArr[3])

    a = a1 + a2 - a1 * a2
    r = (r1 * a1 + r2 * a2 - r1 * a1 * a2) / a
    g = (g1 * a1 + g2 * a2 - g1 * a1 * a2) / a
    b = (b1 * a1 + b2 * a2 - b1 * a1 * a2) / a

    return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')'
  }

  var hexadecimalToRGBA = function (hex) {
    hex = hex.substr(1).toUpperCase();

    var r, g, b;

    switch (hex.length) {
      case 3:
        r = hex[0] + hex[0]
        g = hex[1] + hex[1]
        b = hex[2] + hex[2]
        break
      case 6:
        r = hex.substr(0,2)
        g = hex.substr(2,2)
        b = hex.substr(4,2)
        break
    }

    return 'rgba(' + parseInt(r, 16) + ', ' + parseInt(g, 16) + ', ' + parseInt(b, 16) + ', 1)';
  }


  var formatColor = function (color) {
    var contentExp = /rgba\((.+)\)/

    color = color.replace(/\s+/g, '').match(contentExp)[1]

    var colorArr = color.split(',')

    return 'rgba(' +
      Number(colorArr[0]).toFixed(0) + ', ' +
      Number(colorArr[1]).toFixed(0) + ', ' +
      Number(colorArr[2]).toFixed(0) + ', ' +
      Number(Number(colorArr[3]).toFixed(2)) +
      ')'
  }

  // Work with options here

  return function (root) {
    // Transform CSS AST here
    if (opts.disabled) {
      return false
    }

    return root.walkDecls(function (decl) {
      var key = decl.prop
      var value = decl.value

      if (~propsList.indexOf(key) && !(~opts.exclude.indexOf(key))) {
        var exp1 = /(((rgba\(((([0-9]{1})|([1-9]{1}[0-9]{1})|(1[0-9]{2})|(2[0-4]{1}[0-9]{1})|(25[0-5]{1})),\s*){3}(0|1|(0\.[0-9]{1,2}))\))|(#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})))\s*\+\s*)+((rgba\(((([0-9]{1})|([1-9]{1}[0-9]{1})|(1[0-9]{2})|(2[0-4]{1}[0-9]{1})|(25[0-5]{1})),\s*){3}(0|1|(0\.[0-9]{1,2}))\))|(#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})))/g
        var exp2 = /(((rgba\(((([0-9]{1})|([1-9]{1}[0-9]{1})|(1[0-9]{2})|(2[0-4]{1}[0-9]{1})|(25[0-5]{1})),\s*){3}(0|1|(0\.[0-9]{1,2}))\))|(#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})))\s*)+((rgba\(((([0-9]{1})|([1-9]{1}[0-9]{1})|(1[0-9]{2})|(2[0-4]{1}[0-9]{1})|(25[0-5]{1})),\s*){3}(0|1|(0\.[0-9]{1,2}))\))|(#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})))/g

        var currentArr = opts.divide ? value.match(exp1) : value.match(exp2)

        if (currentArr && currentArr.length) {
          currentArr.forEach(function (item) {
            var colorArr = []
            if (opts.divide) {
              colorArr = item.replace(/\s+/g, '').split('+')
            } else {
              colorArr = item.replace(/\s+/g, '').replace(/(#|rgba)/g, '|$1').split('|')
              colorArr.shift()
            }

            var currentColor = colorArr.shift()

            while (colorArr.length) {
              var nextColor = colorArr.shift()

              currentColor = calculate(currentColor, nextColor)
            }

            decl.value = decl.value
              .replace(item, formatColor(currentColor))
          })
        }
      }
    })
  }
})
