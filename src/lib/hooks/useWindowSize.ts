'use client';

import { useState, useEffect } from 'react';

export function useWindowSize(): { width: number | null; height: number | null } {
  const [size, setSize] = useState<{ width: number | null; height: number | null }>({
    width: typeof window !== 'undefined' ? window.innerWidth : null,
    height: typeof window !== 'undefined' ? window.innerHeight : null,
  });

  useEffect(() => {
    function onResize() {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    }
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return size;
}
