import { blur2, max } from 'd3-array';
import { scalePow, scaleLinear } from 'd3-scale';
import { interpolateTurbo } from 'd3-scale-chromatic';
import { color } from 'd3-color';
import Kapsule from 'kapsule';
import accessorFn from 'accessor-fn';

export default Kapsule({
  props: {
    width: { default: window.innerWidth },
    height: { default: window.innerHeight },
    data: { default: [] },
    x: { default: d => d[0] },
    y: { default: d => d[1] },
    value: { default: 1 },
    blurRadius: { default: 30 },
    pxRatio: { default: 2 }, // pixelation factor to improve performance. Integer number.
    colorInterpolator: {
      default: interpolateTurbo,
      onChange(colorInterpolator, state) {
        const colorDomain = [...new Array(50)].map((_, idx, arr) => idx / (arr.length - 1));
        const colorArr = colorDomain.map((_, idx) => color(colorInterpolator(idx/(colorDomain.length - 1))));
        state.rScale = scaleLinear(colorDomain, colorArr.map(c => c.r));
        state.gScale = scaleLinear(colorDomain, colorArr.map(c => c.g));
        state.bScale = scaleLinear(colorDomain, colorArr.map(c => c.b));
      }
    },
    opacity: { default: 0.7 }
  },

  init: function(domNode, state) {
    // Wipe DOM
    domNode.innerHTML = '';

    state.canvas = document.createElement('canvas');
    state.canvas.style.display = 'block';
    domNode.appendChild(state.canvas);
  },

  update: function updateFn(state) {
    const bw = state.blurRadius;
    const mgn = bw * 3; // compute heatmap with margin outside visible area to prevent flickering when points fall off the edge of the canvas.
    const pxR = state.pxRatio;

    const w = Math.floor(state.width);
    const h = Math.floor(state.height);
    const pxW = Math.ceil(w / pxR);
    const pxH = Math.ceil(h / pxR);
    const pxBw = Math.ceil(bw / pxR);
    const pxMgn = Math.ceil(mgn / pxR);
    const matW = pxW + 2 * pxMgn;
    const matH = pxH + 2 * pxMgn;
    const pxMatrix = new Float32Array(matW * matH);

    const getX = accessorFn(state.x);
    const getY = accessorFn(state.y);
    const getWeight = accessorFn(state.value);

    state.data.forEach(d => {
      const x = Math.round(getX(d) / pxR) + pxMgn;
      const y = Math.round(getY(d) / pxR) + pxMgn;
      if (x < 0 || x >= matW || y < 0 || y >= matH) return;
      pxMatrix[x + y * matW] = getWeight(d);
    });
    blur2({ data: pxMatrix, width: matW }, pxBw);

    // Remove matrix margin
    const visMatrix= new Float32Array(pxW * pxH).map((_, idx)=>
      pxMatrix[idx % pxW + pxMgn + Math.floor(idx / pxW + pxMgn) * matW]
    );

    const imgData = new ImageData(w, h);
    const maxVal = max(visMatrix) || 0;
    const pxIdxFn = pxR === 1
      ? idx => idx
      : idx => ((idx % pxW) + Math.floor(idx / pxW) * w) * pxR;

    const opacityScale = scalePow([0, 0.25], [0, 255 * state.opacity])
      .exponent(2)
      .clamp(true);

    visMatrix.forEach((val, idx) => {
      if (val) {
        const t = val / maxVal;
        const r = state.rScale(t);
        const g = state.gScale(t);
        const b = state.bScale(t);
        const o = opacityScale(t);

        const pxIdx = pxIdxFn(idx);
        for (let ox = 0; ox < pxR; ox++) {
          for (let oy = 0; oy < pxR; oy++) {
            const i = (pxIdx + ox + oy * w) * 4;
            imgData.data[i] = r;
            imgData.data[i + 1] = g;
            imgData.data[i + 2] = b;
            imgData.data[i + 3] = o;
          }
        }
      }
    });

    state.canvas.width = w;
    state.canvas.height = h;
    const ctx = state.canvas.getContext('2d');
    ctx.clearRect(0, 0, w, h);
    ctx.putImageData(imgData, 0, 0);
  }
});
