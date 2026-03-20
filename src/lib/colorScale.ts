import { scaleSequentialSqrt } from 'd3-scale';
import { interpolateBlues, interpolateOranges } from 'd3-scale-chromatic';
import type { MetricKey, StateData } from '../types';

export function buildColorScale(data: StateData[], metric: MetricKey) {
  const values = data.map((d) => d[metric] as number);
  const min = Math.min(...values);
  const max = Math.max(...values);

  const interpolator =
    metric === 'population' ? interpolateBlues : interpolateOranges;

  const scale = scaleSequentialSqrt(interpolator).domain([min, max]);

  return { scale, min, max };
}

export function getStateColor(
  value: number | undefined,
  scale: (value: number) => string,
  min: number,
  max: number,
): string {
  if (value === undefined) return '#27272a';
  const clampedMin = min + (max - min) * 0.15;
  return scale(Math.max(clampedMin, value));
}
