import { useCallback } from 'react';
import type { StateFeature, StateData, MetricKey } from '../types';
import { getPathD } from '../lib/projection';
import { getStateColor } from '../lib/colorScale';

interface Props {
  feature: StateFeature;
  stateData: StateData | undefined;
  metric: MetricKey;
  scale: (value: number) => string;
  min: number;
  max: number;
  isSelected: boolean;
  strokeWidth: number;
  onMouseEnter: (e: React.MouseEvent, state: StateData) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
  onClick: (feature: StateFeature, state: StateData) => void;
}

export function StatePath({
  feature,
  stateData,
  metric,
  scale,
  min,
  max,
  isSelected,
  onMouseEnter,
  onMouseMove,
  onMouseLeave,
  onClick,
}: Props) {
  const d = getPathD(feature);
  const value = stateData?.[metric] as number | undefined;
  const fill = getStateColor(value, scale, min, max);

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent) => {
      if (stateData) onMouseEnter(e, stateData);
    },
    [stateData, onMouseEnter],
  );

  const handleClick = useCallback(() => {
    if (stateData) onClick(feature, stateData);
  }, [feature, stateData, onClick]);

  if (!d) return null;

  return (
    <path
      d={d}
      fill={fill}
      stroke={isSelected ? '#FBF9FF' : '#1f2937'}
      strokeWidth={isSelected ? 1 : 0.5}
      strokeLinejoin='round'
      className='transition-all duration-500 cursor-pointer'
      style={{
        filter: isSelected ? 'brightness(1.2)' : undefined,
        transitionProperty: 'fill, stroke, stroke-width, filter',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onClick={handleClick}
    />
  );
}
