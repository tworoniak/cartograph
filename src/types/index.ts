import type { Feature, Geometry } from 'geojson';

export type MetricKey = 'population' | 'unemployment';

export interface StateProperties {
  name: string;
  fips: string;
}

export type StateFeature = Feature<Geometry, StateProperties>;

export interface StateData {
  fips: string;
  name: string;
  population: number;
  unemployment: number;
  populationDensity: number;
}

export interface MetricConfig {
  key: MetricKey;
  label: string;
  unit: string;
  format: (value: number) => string;
  colorScheme: 'blues' | 'oranges';
}

export interface TooltipData {
  x: number;
  y: number;
  state: StateData;
}

export interface ZoomTransform {
  x: number;
  y: number;
  k: number;
}
