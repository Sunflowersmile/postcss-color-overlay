# PostCSS Color Overlay [![Build Status][ci-img]][ci]

[PostCSS] 默认只对包含在'background', 'background-color', 'border', 'border-left', 'border-right', 'border-top', 
'border-bottom', 'border-color', 'border-left-color', 'border-right-color', 'border-top-color', 'border-bottom-color', 
'color', 'box-shadow'属性中的rgba色值进行叠加运算。可解决多个带Alpha通道的色值叠加问题，书写顺序为色值自下而上的叠加顺序，书写顺序会影响运算结果。

[PostCSS]: https://github.com/postcss/postcss
[ci-img]:  https://travis-ci.org/Sunflowersmile/postcss-color-overlay.svg
[ci]:      https://travis-ci.org/Sunflowersmile/postcss-color-overlay

```css
.foo {
    /* Input example */
    color: rgba(255, 255, 255, 1) + rgba(255, 0, 0, 0.5);
    background: rgba(255, 255, 255, 1) + rgba(255, 0, 0, 0.5) + rgba(0, 0, 255, 0.5) url("../img/bg.png") repeat-x;
}
```

```css
.foo {
  /* Output example */
  color: rgba(255, 128, 128, 1);
  background: rgba(128, 64, 191, 1) url("../img/bg.png") repeat-x;
}
```

## Usage

```js
var options = {
  disabled: false, // 是否禁用该插件
  include: [], // 包含在运算范围内的css属性
  exclude: [] // 不包含在运算范围内的css属性（优先级最高）
};
postcss([ require('postcss-color-overlay')(options) ])
```

See [PostCSS] docs for examples for your environment.
