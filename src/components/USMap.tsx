import { useCallback, useEffect, useRef } from 'react';
import type { MetricKey, StateFeature, StateData } from '../types';
import { StatePath } from './StatePath';
import { StateLabel } from './StateLabel';
import { getStateColor } from '../lib/colorScale';
import { WIDTH, HEIGHT } from '../lib/projection';
import { useZoom } from '../hooks/useZoom';
import { buildColorScale } from '../lib/colorScale';
import { stateDataByFips, stateData as allStateData } from '../data/stateData';

interface Props {
  features: StateFeature[];
  metric: MetricKey;
  selectedFips: string | null;
  onStateClick: (feature: StateFeature, state: StateData) => void;
  onMouseEnter: (e: React.MouseEvent, state: StateData) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
}

export function USMap({
  features,
  metric,
  selectedFips,
  onStateClick,
  onMouseEnter,
  onMouseMove,
  onMouseLeave,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { transform, initZoom, focusFeature, resetZoom } = useZoom(svgRef);
  const { scale, min, max } = buildColorScale(allStateData, metric);

  useEffect(() => {
    initZoom();
  }, [initZoom]);

  const handleClick = useCallback(
    (feature: StateFeature, state: StateData) => {
      if (selectedFips === state.fips) {
        resetZoom();
        onStateClick(feature, state);
      } else {
        focusFeature(feature);
        onStateClick(feature, state);
      }
    },
    [selectedFips, focusFeature, resetZoom, onStateClick],
  );

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className='w-full h-full'
      style={{ background: 'transparent' }}
    >
      <g
        transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}
      >
        {features.map((f) => {
          const fips = f.properties.fips;
          const data = stateDataByFips.get(fips);
          return (
            <StatePath
              key={fips}
              feature={f}
              stateData={data}
              metric={metric}
              scale={scale}
              min={min}
              max={max}
              isSelected={selectedFips === fips}
              strokeWidth={
                selectedFips === fips ? 1.5 / transform.k : 0.5 / transform.k
              }
              onMouseEnter={onMouseEnter}
              onMouseMove={onMouseMove}
              onMouseLeave={onMouseLeave}
              onClick={handleClick}
            />
          );
        })}
        {/* State labels */}
        {features.map((f) => {
          const fips = f.properties.fips;
          const data = stateDataByFips.get(fips);
          const value = data?.[metric] as number | undefined;
          const fill = getStateColor(value, scale, min, max);
          return (
            <StateLabel
              key={`label-${fips}`}
              feature={f}
              fill={fill}
              zoomScale={transform.k}
            />
          );
        })}
      </g>
    </svg>
  );
}
