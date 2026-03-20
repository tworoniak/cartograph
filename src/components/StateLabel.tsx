import { getFeatureCentroid } from '../lib/projection';
import { stateAbbreviations } from '../data/stateAbbreviations';
import type { StateFeature } from '../types';
import { getContrastFromFill } from '../lib/colorUtils';

interface Props {
  feature: StateFeature;
  fill: string;
  zoomScale: number;
}

// Minimum SVG area to show a label — skips tiny states at low zoom
const MIN_LABEL_AREA = 800;

export function StateLabel({ feature, fill, zoomScale }: Props) {
  const fips = feature.properties.fips;
  const abbr = stateAbbreviations[fips];
  if (!abbr) return null;

  const [cx, cy] = getFeatureCentroid(feature);
  if (isNaN(cx) || isNaN(cy)) return null;

  // Scale font inversely with zoom so labels stay consistent size
  const fontSize = 10 / zoomScale;
  const minSize = MIN_LABEL_AREA / zoomScale;

  // Skip labels for very small states at low zoom
  if (
    fontSize > minSize &&
    ['RI', 'DE', 'CT', 'NJ', 'MD', 'MA', 'VT', 'NH', 'DC'].includes(abbr) &&
    zoomScale < 2
  ) {
    return null;
  }

  const textColor = getContrastFromFill(fill);

  return (
    <text
      x={cx}
      y={cy}
      textAnchor='middle'
      dominantBaseline='central'
      fontSize={fontSize}
      fill={textColor}
      fontFamily='ui-monospace, monospace'
      fontWeight='600'
      pointerEvents='none'
      style={{ userSelect: 'none' }}
    >
      {abbr}
    </text>
  );
}
