import React, { useEffect, useMemo, useRef, useState } from 'react';
import AppBackground from './AppBackground';
import LoginCard from './Login';

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
  return {
    left: Math.round(vw / 2 - baseW / 2),
    top: Math.round(vh / 2 - baseH / 2) - 12,
    width: baseW,
    height: baseH,
  };
}

export default function AuthGate({ booting, onAuthed, logoUrl, backgroundUrl }) {
  const [phase, setPhase] = useState(() => (booting ? 'splash' : 'done')); // splash | reveal | done
  const [logoFixed, setLogoFixed] = useState(null); // {left, top, width, height}
  const [logoTransform, setLogoTransform] = useState('none');
  const [overlayVisible, setOverlayVisible] = useState(true);
  const targetRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    if (phase !== 'splash') return;
    if (prefersReducedMotion()) return;
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
    const sx = start.width / Math.max(1, end.width);
    const sy = start.height / Math.max(1, end.height);

    setLogoFixed({
      left: Math.round(end.left),
      top: Math.round(end.top),
      width: Math.round(end.width),
      height: Math.round(end.height),
    });
    setLogoTransform(`translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`);
    setOverlayVisible(true);
  }, [phase]);

  useEffect(() => {
    if (booting) return;
    if (phase !== 'splash') return;

    if (prefersReducedMotion()) {
      setPhase('done');
      setOverlayVisible(false);
      return;
    }

    if (!targetRef.current) {
      setPhase('done');
      setOverlayVisible(false);
      return;
    }

    setPhase('reveal');

    rafRef.current = window.requestAnimationFrame(() => {
      setLogoTransform('translate(0px, 0px) scale(1, 1)');
      rafRef.current = null;
    });

    const t = window.setTimeout(() => {
      setPhase('done');
      setOverlayVisible(false);
    }, 820);

    return () => window.clearTimeout(t);
  }, [booting, phase]);

  const showCard = phase !== 'splash';
  const showFinalLogo = phase === 'done';
  const showLoader = phase !== 'done';

  const cardClassName = useMemo(() => {
    if (!showCard) return 'opacity-0 translate-y-5 pointer-events-none';
    if (phase === 'reveal') return 'opacity-100 translate-y-0';
    return 'opacity-100 translate-y-0';
  }, [phase, showCard]);

  return (
    <div className="relative flex h-[100dvh] w-full items-center justify-center bg-gray-100 px-4 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <AppBackground imageUrl={backgroundUrl} opacity={0.1} />
      <style>{`
        @keyframes sars-indeterminate {
          0% { transform: translateX(-70%); }
          50% { transform: translateX(10%); }
          100% { transform: translateX(130%); }
        }
      `}</style>

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center">
        <div
          ref={targetRef}
          className="relative mb-4 w-[42%] max-w-md aspect-[349/315]"
          aria-hidden="true"
        >
          <img
            src={logoUrl}
            alt="SARS"
            className={`h-full w-full rounded-3xl object-contain shadow-lg transition-opacity duration-300 ${
              showFinalLogo ? 'opacity-100' : 'opacity-0'
            }`}
            draggable="false"
          />
        </div>

        <div className={`w-full transform-gpu transition-all duration-[720ms] ease-in-out ${cardClassName}`}>
          <LoginCard onAuthed={onAuthed} />
        </div>

        {showLoader ? (
          <div
            className={`absolute inset-0 flex items-center justify-center ${
              phase === 'splash' ? 'pointer-events-auto' : 'pointer-events-none'
            }`}
          >
            <div
              className={`flex flex-col items-center gap-2 rounded-2xl bg-white/80 px-4 py-3 text-sm font-extrabold text-blue-800 shadow-sm ring-1 ring-gray-200 backdrop-blur transition-opacity duration-300 dark:bg-gray-950/70 dark:text-blue-200 dark:ring-gray-800 ${
                phase === 'splash' ? 'opacity-100' : 'opacity-0'
              }`}
            >
              Loading
              <div className="h-2 w-44 overflow-hidden rounded-full bg-blue-100 ring-1 ring-blue-200 dark:bg-blue-950/30 dark:ring-blue-900/40">
                <div
                  className="h-full w-2/3 rounded-full bg-blue-800"
                  style={{ animation: 'sars-indeterminate 1.3s ease-in-out infinite' }}
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {overlayVisible && logoFixed ? (
        <div
          className="pointer-events-none fixed z-20"
          style={{
            left: logoFixed.left,
            top: logoFixed.top,
            width: logoFixed.width,
            height: logoFixed.height,
          }}
          aria-hidden="true"
        >
          <img
            src={logoUrl}
            alt=""
            className="h-full w-full rounded-3xl object-contain shadow-lg will-change-transform"
            style={{
              transformOrigin: 'center',
              transform: logoTransform,
              transition:
                phase === 'splash' ? 'none' : 'transform 720ms cubic-bezier(0.2, 0.9, 0.2, 1)',
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
