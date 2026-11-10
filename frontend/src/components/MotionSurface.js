'use client';
import { useLayoutEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { gsap } from 'gsap';
export default function MotionSurface({ children }) {
  const root = useRef(null);
  const pathname = usePathname();
  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      if (document.documentElement.dataset.motion === 'reduced') return;
      const fast = document.documentElement.dataset.motion === 'fast';
      const scope = gsap.context(() => {
        gsap.fromTo('.page-heading', { clipPath: 'inset(0 0 20% 0)', y: 12, opacity: 0.7 }, { clipPath: 'inset(0 0 0% 0)', y: 0, opacity: 1, duration: fast ? 0.22 : 0.45, ease: 'power3.out', clearProps: 'all' });
        gsap.fromTo('.settings-section', { y: 18, opacity: 0.6 }, { y: 0, opacity: 1, duration: fast ? 0.2 : 0.42, stagger: 0.05, ease: 'power3.out', clearProps: 'all' });
      }, root);
      return () => scope.revert();
    });
    return () => media.revert();
  }, [pathname]);
  return <div className="motion-surface" ref={root}>{children}</div>;
}
