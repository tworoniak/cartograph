import { geoAlbersUsa, geoPath } from 'd3-geo';
import type { GeoPermissibleObjects } from 'd3-geo';

export const WIDTH = 960;
export const HEIGHT = 600;

export const projection = geoAlbersUsa()
  .scale(1300)
  .translate([WIDTH / 2, HEIGHT / 2]);

export const pathGenerator = geoPath(projection);

export function getPathD(feature: GeoPermissibleObjects): string {
  return pathGenerator(feature) ?? '';
}

export function getFeatureCentroid(
  feature: GeoPermissibleObjects,
): [number, number] {
  return pathGenerator.centroid(feature);
}

export function getFeatureBounds(
  feature: GeoPermissibleObjects,
): [[number, number], [number, number]] {
  return pathGenerator.bounds(feature);
}
