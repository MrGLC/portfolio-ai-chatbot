import { useEffect, useState } from 'react';

export interface PerfProfile {
  tier: 'full' | 'lite';
  dpr: [number, number];
  particleScale: number;
  animate: boolean;
}

export function getPerfProfile(width: number, reducedMotion: boolean): PerfProfile {
  const lite = width < 768 || reducedMotion;
  return {
    tier: lite ? 'lite' : 'full',
    dpr: lite ? [1, 1.5] : [1, 2],
    particleScale: lite ? 0.25 : 1,
    animate: !reducedMotion,
  };
}

export function usePerfProfile(): PerfProfile {
  const [profile, setProfile] = useState<PerfProfile>(() =>
    getPerfProfile(window.innerWidth, window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setProfile(getPerfProfile(window.innerWidth, mq.matches));
    window.addEventListener('resize', update);
    mq.addEventListener('change', update);
    return () => {
      window.removeEventListener('resize', update);
      mq.removeEventListener('change', update);
    };
  }, []);
  return profile;
}
