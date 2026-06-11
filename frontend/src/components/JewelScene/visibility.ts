import { useEffect, useRef, useState } from 'react';

export function resolveFrameloop(visible: boolean, reducedMotion: boolean): 'always' | 'never' {
  if (reducedMotion || !visible) return 'never';
  return 'always';
}

// Tracks whether a wrapper element is in the viewport (hero scene pause-when-scrolled-past).
export function useInViewport<T extends HTMLElement>(): { ref: React.RefObject<T>; visible: boolean } {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, visible };
}
