import React, { useEffect, useMemo, useRef, useState } from 'react';
import AppBackground from './AppBackground';
import LoginCard from './Login';
import { useTheme } from '../ThemeContext';

function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function computeStartRectForEnd(endRect) {
  const vw = window.innerWidth || 360;
  const vh = window.innerHeight || 740;
  const ratio = endRect?.width ? endRect.height / endRect.width : 1;
  const desiredW = endRect?.width ? Math.round(endRect.width * 1.25) : Math.round(vw * 0.22);
  const baseW = Math.min(Math.round(vw * 0.7), Math.max(72, desiredW));
  const baseH = Math.round(baseW * ratio);
  return { left: Math.round(vw / 2 - baseW / 2), top: Math.round(vh / 2 - baseH / 2) - 12, width: baseW, height: baseH };
}

export default function AuthGate({ booting, onAuthed, logoUrl, backgroundUrl }) {
  const [phase, setPhase] = useState(() => (booting ? 'splash' : 'done'));
  const [logoFixed, setLogoFixed] = useState(null);
  const [logoTransform, setLogoTransform] = useState('none');
  const [overlayVisible, setOverlayVisible] = useState(true);
  const targetRef = useRef(null);
  const rafRef = useRef(null);
  const colors = useTheme();

  useEffect(() => {
    return () => { if (rafRef.current) window.cancelAnimationFrame(rafRef.current); };
  }, []);

  useEffect(() => {
    if (phase !== 'splash') return;
    const targetEl = targetRef.current;
    if (!targetEl) return;
    const end = targetEl.getBoundingClientRect();
    if (!end.width || !end.height) return;

    const start = computeStartRectForEnd(end);
    const endCx = end.left + end.width / 2;
    const endCy = end.top + end.height / 2;
    const startCx = start.left + start.width / 2;
    const startCy = start.top + start.height / 2;
    const dx = startCx - endCx;
    const dy = startCy - endCy;

    setLogoFixed({ left: Math.round(end.left), top: Math.round(end.top), width: Math.round(end.width), height: Math.round(end.height) });

    setLogoTransform(`translate(${dx}px, ${dy}px) scale(0)`);
    setOverlayVisible(true);
  }, [phase]);

  useEffect(() => {
    if (booting) return;
    if (phase !== 'splash') return;

    setPhase('reveal');
    rafRef.current = window.requestAnimationFrame(() => {
      setLogoTransform('translate(0px, 0px) scale(1)');
      rafRef.current = null;
    });

    const t = window.setTimeout(() => {
      setPhase('done');
      setOverlayVisible(false);
    }, 1000);
    return () => window.clearTimeout(t);
  }, [booting, phase]);

  const showCard = phase !== 'splash';
  const showFinalLogo = phase === 'done';
  const showLoader = phase === 'splash';
  const cardClassName = !showCard ? 'opacity-0 translate-y-10 scale-95 pointer-events-none' : 'opacity-100 translate-y-0 scale-100';

  return (
    <div className="relative flex h-[100dvh] w-full items-center justify-center bg-gray-50 px-4 text-gray-900 dark:bg-gray-950 dark:text-gray-100 font-outfit overflow-hidden">
      <AppBackground imageUrl={backgroundUrl} opacity={phase === 'splash' ? 1 : 0.3} blur={phase === 'splash' ? 0 : 4} />

      <style>{`
        @keyframes cc-indeterminate {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center">
        <div ref={targetRef} className="relative mb-6 w-[45%] max-w-md aspect-square">
          <img src={logoUrl} alt="CampusConnect" className={`h-full w-full rounded-[40px] object-contain shadow-2xl transition-all duration-500 ${showFinalLogo ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 rotate-6'}`} draggable="false" />
        </div>

        <div className={`w-full transform-gpu transition-all duration-[1000ms] cubic-bezier(0.34, 1.56, 0.64, 1) ${cardClassName}`}>
          <LoginCard onAuthed={onAuthed} />
        </div>

        {showLoader && (
          <div className="fixed bottom-12 left-0 right-0 flex flex-col items-center gap-4 transition-opacity duration-500">
             <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">System Booting</div>
             <div className="h-[2px] w-32 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                <div className="h-full w-1/2 rounded-full" style={{ backgroundColor: colors.main, animation: 'cc-indeterminate 1.5s infinite linear' }} />
             </div>
          </div>
        )}
      </div>

      {overlayVisible && logoFixed && (
        <div className="pointer-events-none fixed z-20" style={{ left: logoFixed.left, top: logoFixed.top, width: logoFixed.width, height: logoFixed.height }}>
          <img
            src={logoUrl}
            alt=""
            className="h-full w-full rounded-[40px] object-contain shadow-2xl will-change-transform"
            style={{
              transformOrigin: 'center',
              transform: logoTransform,
              transition: phase === 'splash' ? 'none' : 'transform 1000ms cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          />
        </div>
      )}
    </div>
  );
}
