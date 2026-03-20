import { useCallback, useState } from 'react';
import type { StateData, TooltipData } from '../types';

export function useTooltip() {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const showTooltip = useCallback((e: React.MouseEvent, state: StateData) => {
    setTooltip({ x: e.clientX, y: e.clientY, state });
  }, []);

  const moveTooltip = useCallback((e: React.MouseEvent) => {
    setTooltip((prev) =>
      prev ? { ...prev, x: e.clientX, y: e.clientY } : null,
    );
  }, []);

  const hideTooltip = useCallback(() => setTooltip(null), []);

  return { tooltip, showTooltip, moveTooltip, hideTooltip };
}
