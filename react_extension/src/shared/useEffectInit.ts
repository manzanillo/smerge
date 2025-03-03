import { useEffect, useRef, DependencyList, EffectCallback } from 'react';

export default function useEffectInit(effect: EffectCallback, deps?: DependencyList) {
  const hasRun = useRef(false);

  useEffect(() => {
    if (!hasRun.current) {
      effect();
      hasRun.current = true;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
