import type { MetricKey } from '../types';
import { METRICS } from '../data/stateData';

interface Props {
  active: MetricKey;
  onChange: (metric: MetricKey) => void;
}

export function MetricSwitcher({ active, onChange }: Props) {
  return (
    <div className='flex gap-1 p-1 bg-zinc-900 rounded-xl border border-zinc-800'>
      {Object.values(METRICS).map((m) => (
        <button
          key={m.key}
          onClick={() => onChange(m.key)}
          className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer
            ${
              active === m.key
                ? 'bg-zinc-700 text-white shadow'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
