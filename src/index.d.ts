type ObjAccessor<T> = T | string | ((obj: object) => T);

type ColorInterpolator = (t: number) => string;

declare class Heatmap {
  constructor(element: HTMLElement);

  width(): number;
  width(width: number): Heatmap;
  height(): number;
  height(height: number): Heatmap;

  data(): object[];
  data(data: object[]): Heatmap;
  x(): ObjAccessor<number>;
  x(xAccessor: ObjAccessor<number>): Heatmap;
  y(): ObjAccessor<number>;
  y(yAccessor: ObjAccessor<number>): Heatmap;
  value(): ObjAccessor<number>;
  value(valueAccessor: ObjAccessor<number>): Heatmap;

  blurRadius(): number;
  blurRadius(radius: number): Heatmap;
  pxRatio(): number;
  pxRatio(pxRatio: number): Heatmap;
  maxValue(): number | undefined | null | false;
  maxValue(radius: number | undefined | null | false): Heatmap;
  saturation(): number;
  saturation(saturation: number): Heatmap;
  colorInterpolator(): ColorInterpolator;
  colorInterpolator(interpolator: ColorInterpolator): Heatmap;
  opacity(): number;
  opacity(opacity: number): Heatmap;

  getValueAt(x: number, y: number): number;
}

export default Heatmap;
