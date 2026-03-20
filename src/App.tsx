import { useCallback, useState } from 'react';
import type { MetricKey, StateData, StateFeature } from './types';
import { useMapData } from './hooks/useMapData';
import { useTooltip } from './hooks/useTooltip';
import { buildColorScale } from './lib/colorScale';
import { stateData } from './data/stateData';
import { USMap } from './components/USMap';
import { Tooltip } from './components/Tooltip';
import { ColorLegend } from './components/ColorLegend';
import { StatePanel } from './components/StatePanel';
import { MetricSwitcher } from './components/MetricSwitcher';
import { RankList } from './components/RankList';

export default function App() {
  const { features, loading, error } = useMapData();
  const { tooltip, showTooltip, moveTooltip, hideTooltip } = useTooltip();
  const [metric, setMetric] = useState<MetricKey>('population');
  const [selectedState, setSelectedState] = useState<StateData | null>(null);
  const [selectedFips, setSelectedFips] = useState<string | null>(null);

  const { min, max } = buildColorScale(stateData, metric);

  const handleStateClick = useCallback(
    (_feature: StateFeature, state: StateData) => {
      if (selectedFips === state.fips) {
        setSelectedState(null);
        setSelectedFips(null);
      } else {
        setSelectedState(state);
        setSelectedFips(state.fips);
      }
    },
    [selectedFips],
  );

  const handleMetricChange = useCallback((m: MetricKey) => {
    setMetric(m);
  }, []);

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-200 flex flex-col font-sans'>
      {/* Header */}
      <header className='flex items-center justify-between px-6 py-3 border-b border-zinc-800 shrink-0'>
        <div className='flex items-center gap-3'>
          <div className='w-2 h-2 rounded-full bg-blue-500' />
          <h1 className='text-sm font-bold text-zinc-100 tracking-tight'>
            Cartograph
          </h1>
          <span className='text-xs text-zinc-600'>
            US States · Pure SVG · No Mapbox
          </span>
        </div>
        <MetricSwitcher active={metric} onChange={handleMetricChange} />
      </header>

      {/* Main */}
      <div className='flex flex-1 overflow-hidden'>
        {/* Map */}
        <div className='flex-1 flex flex-col overflow-hidden'>
          <div className='flex-1 relative'>
            {loading && (
              <div className='absolute inset-0 flex items-center justify-center'>
                <div className='flex flex-col items-center gap-3'>
                  <div className='w-6 h-6 rounded-full border-2 border-zinc-700 border-t-blue-500 animate-spin' />
                  <span className='text-xs font-mono text-zinc-500'>
                    Fetching GeoJSON from us-atlas...
                  </span>
                </div>
              </div>
            )}
            {error && (
              <div className='absolute inset-0 flex items-center justify-center text-red-400 text-sm'>
                Failed to load map data: {error}
              </div>
            )}
            {!loading && !error && (
              <USMap
                features={features}
                metric={metric}
                selectedFips={selectedFips}
                onStateClick={handleStateClick}
                onMouseEnter={showTooltip}
                onMouseMove={moveTooltip}
                onMouseLeave={hideTooltip}
              />
            )}
          </div>

          {/* Legend + hints */}
          <div className='flex items-end justify-between px-6 py-4 border-t border-zinc-800 shrink-0'>
            <ColorLegend metric={metric} min={min} max={max} />
            <div className='flex items-center gap-4 text-[10px] font-mono text-zinc-600'>
              <span>scroll to zoom</span>
              <span>·</span>
              <span>drag to pan</span>
              <span>·</span>
              <span>click to focus</span>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className='w-72 shrink-0 border-l border-zinc-800 flex flex-col overflow-hidden'>
          {/* State panel — shown when selected */}
          {selectedState && (
            <div className='border-b border-zinc-800 p-4 shrink-0'>
              <StatePanel
                state={selectedState}
                metric={metric}
                onClose={() => {
                  setSelectedState(null);
                  setSelectedFips(null);
                }}
              />
            </div>
          )}

          {/* Rank list — always visible */}
          <div className='flex-1 overflow-y-auto p-3'>
            <RankList
              metric={metric}
              selectedFips={selectedFips}
              onSelect={(fips) => {
                const found = stateData.find((s) => s.fips === fips);
                if (found) {
                  if (selectedFips === fips) {
                    setSelectedState(null);
                    setSelectedFips(null);
                  } else {
                    setSelectedState(found);
                    setSelectedFips(fips);
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && <Tooltip data={tooltip} metric={metric} />}
    </div>
  );
}
