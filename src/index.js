import { blur2, max, range } from 'd3-array';
import { scalePow } from 'd3-scale';
import { interpolateTurbo } from 'd3-scale-chromatic';
import { rgb as d3Rgb } from 'd3-color';
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
    maxValue: {},
    saturation: { default: 1 },
    colorInterpolator: {
      default: interpolateTurbo,
      onChange(colorInterpolator, state) {
        const len = 256 * 2; // [-1...0...1]
        state.colorArr = range(len).map(v => d3Rgb(colorInterpolator(v / (len - 1) * 2 - 1)));
      }
    },
    opacity: {
      default: 0.8,
      onChange(opacity, state) {
        // make it transparent surrounding 0
        const opacityScale = scalePow([-0.25, 0, 0.25], [255 * opacity, 0, 255 * opacity])
          .exponent(2)
          .clamp(true);

        const len = 256 * 2;
        state.opacityArr = range(len).map(v => opacityScale(v / (len - 1) * 2 - 1));
      }
    }
  },

  methods: {
    getValueAt: (state, x, y) => state.valMatrix[
      Math.round(x / state.pxRatio)
      + Math.round(y / state.pxRatio) * Math.ceil(state.width / state.pxRatio)
    ],
    addPoint: function(state, pnt) {
      state.data.push(pnt);

      const w = Math.floor(state.width);
      const h = Math.floor(state.height);
      const pxR = state.pxRatio;
      const pxW = Math.ceil(w / pxR);
      const pxH = Math.ceil(h / pxR);

      const cx = Math.round(accessorFn(state.x)(pnt) / pxR);
      const cy = Math.round(accessorFn(state.y)(pnt) / pxR);
      if (cx < 0 || cx >= pxW || cy < 0 || cy >= pxH) return;
      const val = accessorFn(state.value)(pnt);

      const pntSize = Math.sqrt(state.blurredPnt.length);
      state.blurredPnt.forEach((v, idx) => {
        const x = cx - pntSize / 2 + idx % pntSize;
        if (x < 0 || x >= pxW) return;
        const y = cy - pntSize / 2 + Math.floor(idx / pntSize);
        if (y < 0 || y >= pxH) return;
        state.valMatrix[x + y * pxW] += v * val;
      });

      render(state);

      return this;
    }
  },

  stateInit: () => ({
    valMatrix: []
  }),

  init: (domNode, state) => {
    // Wipe DOM
    domNode.innerHTML = '';

    state.canvas = document.createElement('canvas');
    state.canvas.style.display = 'block';
    state.canvas.style.pointerEvents = 'none';
    domNode.appendChild(state.canvas);
  },

  update: (state, changedProps) => {
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

    if (['blurRadius', 'pxRatio'].some(p => changedProps.hasOwnProperty(p))) {
      // Generate a cached single blurred point matrix for reuse when adding new points
      const pntSize = Math.round(pxBw * 6 / 2) * 2;
      const pntMatrix = new Float32Array(pntSize ** 2);
      pntMatrix[pntSize * (pntSize + 1) / 2] = 1;
      blur2({data: pntMatrix, width: pntSize}, pxBw);
      state.blurredPnt = pntMatrix;
    }

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
    state.valMatrix = new Float32Array(pxW * pxH).map((_, idx)=>
      pxMatrix[idx % pxW + pxMgn + Math.floor(idx / pxW + pxMgn) * matW]
    );

    render(state);
  }
});

function render(state) {
  const w = Math.floor(state.width);
  const h = Math.floor(state.height);
  const pxR = state.pxRatio;
  const pxW = Math.ceil(w / pxR);

  const visMatrix= state.valMatrix;

  const imgData = new ImageData(w, h);
  const maxVal = (state.maxValue || max(visMatrix.map(Math.abs)) || 0) / state.saturation;
  const pxIdxFn = pxR === 1
    ? idx => idx
    : idx => ((idx % pxW) + Math.floor(idx / pxW) * w) * pxR;

  for (let idx = 0, len = visMatrix.length; idx < len; idx++) {
    const val = visMatrix[idx];
    if (val) {
      const t = val / maxVal;
      const arrT = (t + 1) / 2;
      const { r, g, b } = state.colorArr[Math.max(0, Math.min(state.colorArr.length - 1,
        Math.floor(arrT * (state.colorArr.length - 1))
      ))];
      const o = state.opacityArr[Math.max(0, Math.min(state.opacityArr.length - 1,
        Math.floor(arrT * (state.opacityArr.length - 1))
      ))];

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
  }

  state.canvas.width = w;
  state.canvas.height = h;
  const ctx = state.canvas.getContext('2d');
  ctx.clearRect(0, 0, w, h);
  ctx.putImageData(imgData, 0, 0);
}
