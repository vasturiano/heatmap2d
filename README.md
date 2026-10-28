heatmap2d
=========

[![NPM package][npm-img]][npm-url]
[![Build Size][build-size-img]][build-size-url]
[![NPM Downloads][npm-downloads-img]][npm-downloads-url]
[![paypal](https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=L398E7PKP47E8&currency_code=USD&source=url)

Lightweight 2D heatmap canvas for visualizing dense datasets efficiently in the browser.

[![](https://vasturiano.github.io/heatmap2d/examples/basic/preview.png)](https://vasturiano.github.io/heatmap2d/examples/basic/)

A web component to represent a set of 2-dimensional data points as a density heatmap in a canvas.
Uses HTML5 canvas for rendering, with a gaussian blur kernel to estimate the point density.
Supports weighted points, positive and negative values, custom color interpolators, incremental point additions, and a pixelation factor to trade resolution for performance.

## Examples

* [Basic](https://vasturiano.github.io/heatmap2d/examples/basic/) ([source](https://github.com/vasturiano/heatmap2d/blob/master/examples/basic/index.html))
* [Zoom/pan (using d3-zoom, ~10k points)](https://vasturiano.github.io/heatmap2d/examples/zoomable/) ([source](https://github.com/vasturiano/heatmap2d/blob/master/examples/zoomable/index.html))
* [Diverging values (positive and negative weights)](https://vasturiano.github.io/heatmap2d/examples/diverging/) ([source](https://github.com/vasturiano/heatmap2d/blob/master/examples/diverging/index.html))
* [Cursor tracking (adding points on demand)](https://vasturiano.github.io/heatmap2d/examples/cursorTracking/) ([source](https://github.com/vasturiano/heatmap2d/blob/master/examples/cursorTracking/index.html))

## Quick start

```js
import Heatmap from 'heatmap2d';
```
or using a *script* tag
```html
<script src="//cdn.jsdelivr.net/npm/heatmap2d"></script>
```
then
```js
const myHeatmap = new Heatmap(<myDOMElement>)
  .data(<myData>);
```

## API reference

### Data input

| Method | Description | Default |
| --- | --- | :--: |
| <b>data</b>([<i>array</i>]) | Getter/setter for the heatmap data. Each element represents a single point, and is read using the `x`, `y` and `value` accessors below (see [input syntax](#input-json-syntax)). | `[]` |
| <b>x</b>([<i>num</i>, <i>str</i> or <i>fn</i>]) | Data point accessor function, attribute or a numeric constant for the point's horizontal position, in canvas pixels. | `d => d[0]` |
| <b>y</b>([<i>num</i>, <i>str</i> or <i>fn</i>]) | Data point accessor function, attribute or a numeric constant for the point's vertical position, in canvas pixels. | `d => d[1]` |
| <b>value</b>([<i>num</i>, <i>str</i> or <i>fn</i>]) | Data point accessor function, attribute or a numeric constant for the point's weight. Negative values are supported and are mapped to the lower half of the color scale. | `1` |

### Container layout

| Method | Description | Default |
| --- | --- | :--: |
| <b>width</b>([<i>px</i>]) | Getter/setter for the canvas width. | *&lt;window width&gt;* |
| <b>height</b>([<i>px</i>]) | Getter/setter for the canvas height. | *&lt;window height&gt;* |

### Heatmap styling

| Method | Description | Default |
| --- | --- | :--: |
| <b>blurRadius</b>([<i>px</i>]) | Getter/setter for the radius of the gaussian blur applied to each point. Larger values produce a smoother, more diffuse heatmap. | `30` |
| <b>saturation</b>([<i>num</i>]) | Getter/setter for the color saturation factor. The color scale limit is divided by this value, so values above `1` make the extremes of the scale reached sooner, and values below `1` make it more subdued. | `1` |
| <b>maxValue</b>([<i>num</i>]) | Getter/setter for the absolute value that maps to the extremes of the color scale. If not defined, the largest absolute value in the current heatmap is used. Setting an explicit value is useful to keep colors consistent as the data changes. A falsy value (e.g. `null` or `false`) restores the automatic behavior. | *&lt;auto&gt;* |
| <b>colorInterpolator</b>([<i>fn</i>]) | Getter/setter for the color interpolator function, used to represent the values on the heatmap. The function receives a number in the range `[-1, 1]` (with `0` as the neutral value) and should return a color string. Any [d3-scale-chromatic](https://github.com/d3/d3-scale-chromatic) interpolator can be used. | [interpolateTurbo](https://d3js.org/d3-scale-chromatic/sequential#interpolateTurbo) |
| <b>opacity</b>([<i>num</i>]) | Getter/setter for the maximum opacity of the heatmap, between `0` and `1`. The heatmap fades to fully transparent around the value `0`, to let the underlying content show through in empty areas. | `0.8` |
| <b>pxRatio</b>([<i>int</i>]) | Getter/setter for the pixelation factor used to compute and render the heatmap. A value of `1` computes the heatmap at full canvas resolution, while larger integer values compute it on a coarser grid, which improves performance at the cost of detail. | `2` |

### Methods

| Method | Description |
| --- | --- |
| <b>addPoint</b>(<i>point</i>) | Adds a single data point to the heatmap and incrementally updates the rendering, which is considerably faster than resetting the full `data` array. The point is read using the same `x`, `y` and `value` accessors as the rest of the data. |
| <b>getValueAt</b>(<i>x</i>, <i>y</i>) | Returns the current heatmap value at the given canvas pixel coordinates. |

### Input JSON syntax

By default, each data point is an array with the `[x, y]` pixel coordinates:

```js
[
  [120, 80],
  [135, 92],
  [410, 300],
  ...
]
```

Other structures can be used by configuring the accessors, for example `.x('left').y('top').value('weight')` for points of the form `{ left: 120, top: 80, weight: 3 }`.

## ❤️ Support This Project

If you find this module useful and would like to support its development, you can [buy me a ☕](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=L398E7PKP47E8&currency_code=USD&source=url). Your contributions help keep open-source sustainable!
[![paypal](https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=L398E7PKP47E8&currency_code=USD&source=url)


[npm-img]: https://img.shields.io/npm/v/heatmap2d
[npm-url]: https://npmjs.org/package/heatmap2d
[build-size-img]: https://img.shields.io/bundlephobia/minzip/heatmap2d
[build-size-url]: https://bundlephobia.com/result?p=heatmap2d
[npm-downloads-img]: https://img.shields.io/npm/dt/heatmap2d
[npm-downloads-url]: https://www.npmtrends.com/heatmap2d
