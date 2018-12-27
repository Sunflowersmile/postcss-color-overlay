var postcss = require('postcss')

var plugin = require('./')

function run (input, output, opts) {
  return postcss([plugin(opts)]).process(input).then(function (result) {
    expect(result.css).toEqual(output)
    expect(result.warnings()).toHaveLength(0)
  })
}

/* Write tests here

it('does something', function () {
  return run('a{ }', 'a{ }', { })
})

*/

it('should handle colors overlay more than two', function () {
  return run(
    '.foo {' +
    ' color: rgba(255, 255, 255, 1) + rgba(255, 0, 0, 0.5);' +
    ' border-color: #FFF + rgba(255, 0, 0, 0.5);' +
    ' background:' +
    ' rgba(255, 255, 255, 1) + rgba(255, 0, 0, 0.5) + rgba(0, 0, 255, 0.5)' +
    ' url("../img/bg.png") repeat-x;' +
    ' box-shadow:' +
    ' 0 0 5px 3px rgba(255, 0, 0, 0.6) + rgba(0, 255, 0, 0.6),' +
    ' 0 0 5px 6px rgba(0, 182, 0, 0.6) + rgba(0, 255, 0, 0.6),' +
    ' 0 0 5px 10px rgba(255, 255, 0, 0.6);' +
    '}',
    '.foo {' +
    ' color: rgba(255, 128, 128, 1);' +
    ' border-color: rgba(255, 128, 128, 1);' +
    ' background: rgba(128, 64, 191, 1) url("../img/bg.png") repeat-x;' +
    ' box-shadow:' +
    ' 0 0 5px 3px rgba(73, 182, 0, 0.84),' +
    ' 0 0 5px 6px rgba(0, 234, 0, 0.84),' +
    ' 0 0 5px 10px rgba(255, 255, 0, 0.6);' +
    '}',
    { }
  )
})

it('should not handle the color if the options disabled is true', function () {
  return run(
    '.a {' +
    ' border: 1px solid #333333 + #AFAFAF;' +
    ' color: rgba(255, 255, 255, 1) + rgba(255, 0, 0, 0.5);' +
    '}',
    '.a {' +
    ' border: 1px solid #333333 + #AFAFAF;' +
    ' color: rgba(255, 255, 255, 1) + rgba(255, 0, 0, 0.5);' +
    '}',
    {
      disabled: true
    }
  )
})

it('should not handle the color if the props was included exclude',
  function () {
    return run(
      '.foo {' +
      '  color: rgba(255, 255, 255, 1) + rgba(255, 0, 0, 0.5);' +
      '  background:' +
      ' rgba(255, 255, 255, 1) + rgba(255, 0, 0, 0.5) + rgba(0, 0, 255, 0.5)' +
      ' url("../img/bg.png") repeat-x;' +
      '  box-shadow:' +
      '    0 0 5px 3px rgba(255, 0, 0, 0.6) + rgba(0, 255, 0, 0.6),' +
      '    0 0 5px 6px rgba(0, 182, 0, 0.6) + rgba(0, 255, 0, 0.6),' +
      '    0 0 5px 10px rgba(255, 255, 0, 0.6);' +
      '}',
      '.foo {' +
      '  color: rgba(255, 255, 255, 1) + rgba(255, 0, 0, 0.5);' +
      '  background: rgba(128, 64, 191, 1) url("../img/bg.png") repeat-x;' +
      '  box-shadow:' +
      '    0 0 5px 3px rgba(73, 182, 0, 0.84),' +
      '    0 0 5px 6px rgba(0, 234, 0, 0.84),' +
      '    0 0 5px 10px rgba(255, 255, 0, 0.6);' +
      '}',
      {
        exclude: ['color']
      }
    )
  }
)

it('should handle the color if the props was included include', function () {
  return run(
    '.foo {' +
    '  width: rgba(255, 255, 255, 1) + rgba(255, 0, 0, 0.5);' +
    '}',
    '.foo {' +
    '  width: rgba(255, 128, 128, 1);' +
    '}',
    {
      include: ['width']
    }
  )
})

it('should not handle the color if the props was included both exclude and include',
  function () {
    return run(
      '.foo {' +
      '  color: rgba(255, 255, 255, 1) + rgba(255, 0, 0, 0.5);' +
      '  background:' +
      ' rgba(255, 255, 255, 1) + rgba(255, 0, 0, 0.5) + rgba(0, 0, 255, 0.5)' +
      ' url("../img/bg.png") repeat-x;' +
      '  box-shadow:' +
      '    0 0 5px 3px rgba(255, 0, 0, 0.6) + rgba(0, 255, 0, 0.6),' +
      '    0 0 5px 6px rgba(0, 182, 0, 0.6) + rgba(0, 255, 0, 0.6),' +
      '    0 0 5px 10px rgba(255, 255, 0, 0.6);' +
      '}',
      '.foo {' +
      '  color: rgba(255, 255, 255, 1) + rgba(255, 0, 0, 0.5);' +
      '  background: rgba(128, 64, 191, 1) url("../img/bg.png") repeat-x;' +
      '  box-shadow:' +
      '    0 0 5px 3px rgba(73, 182, 0, 0.84),' +
      '    0 0 5px 6px rgba(0, 234, 0, 0.84),' +
      '    0 0 5px 10px rgba(255, 255, 0, 0.6);' +
      '}',
      {
        exclude: ['color'],
        include: ['color']
      }
    )
  }
)

it('should handle only color write together if the props divide is false',
  function () {
    return run(
      '.foo {' +
      '  color: #FFF rgba(255, 0, 0, 0.5);' +
      '  background:' +
      ' rgba(255, 255, 255, 1) rgba(255, 0, 0, 0.5) rgba(0, 0, 255, 0.5)' +
      ' url("../img/bg.png") repeat-x;' +
      '  box-shadow:' +
      '    0 0 5px 3px rgba(255, 0, 0, 0.6) + rgba(0, 255, 0, 0.6),' +
      '    0 0 5px 6px rgba(0, 182, 0, 0.6) + rgba(0, 255, 0, 0.6),' +
      '    0 0 5px 10px rgba(255, 255, 0, 0.6);' +
      '}',
      '.foo {' +
      '  color: rgba(255, 128, 128, 1);' +
      '  background: rgba(128, 64, 191, 1) url("../img/bg.png") repeat-x;' +
      '  box-shadow:' +
      '    0 0 5px 3px rgba(255, 0, 0, 0.6) + rgba(0, 255, 0, 0.6),' +
      '    0 0 5px 6px rgba(0, 182, 0, 0.6) + rgba(0, 255, 0, 0.6),' +
      '    0 0 5px 10px rgba(255, 255, 0, 0.6);' +
      '}',
      {
        divide: false
      }
    )
  }
)
