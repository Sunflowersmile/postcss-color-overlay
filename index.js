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

  function calculate (bottom, top) {
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

  function formatColor (color) {
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
        var exp1 = /((rgba\(((([0-9]{1})|([1-9]{1}[0-9]{1})|(1[0-9]{2})|(2[0-4]{1}[0-9]{1})|(25[0-5]{1})),\s*){3}(0|1|(0\.[0-9]{1,2}))\))\s*\+\s*)+(rgba\(((([0-9]{1})|([1-9]{1}[0-9]{1})|(1[0-9]{2})|(2[0-4]{1}[0-9]{1})|(25[0-5]{1})),\s*){3}(0|1|(0\.[0-9]{1,2}))\))/g
        var exp2 = /(rgba\(((([0-9]{1})|([1-9]{1}[0-9]{1})|(1[0-9]{2})|(2[0-4]{1}[0-9]{1})|(25[0-5]{1})),\s*){3}(0|1|(0\.[0-9]{1,2}))\)){2,}/g

        var currentArr = opts.divide ? value.match(exp1) : value.match(exp2)

        if (currentArr && currentArr.length) {
          currentArr.forEach(function (item) {
            var colorArr = []
            if (opts.divide) {
              colorArr = item.replace(/\s+/g, '').split('+')
            } else {
              colorArr = item.replace(/\s+/g, '').replace(/rgba/g, '|rgba').split('|')
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
