import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, FileText, LayoutDashboard } from 'lucide-react';

const items = [
  { key: 'assignments', label: 'Assignments', icon: FileText },
  { key: 'home', label: 'Home', icon: LayoutDashboard, raised: true },
  { key: 'calendar', label: 'Calendar', icon: CalendarDays },
];

export default function FooterNav({ tab, onSelectTab }) {
  const containerRef = useRef(null);
  const buttonRefs = useRef(new Map());
  const iconRefs = useRef(new Map());
  const [indicator, setIndicator] = useState(null);
  const [trail, setTrail] = useState(null);
  const previousTabRef = useRef(tab);
  const wobbleRef = useRef(0);

  const cfgByKey = useMemo(
    () => ({
      assignments: { size: 40, iconSize: 26, dy: -10 },
      home: { size: 60, iconSize: 28, dy: -14 },
      calendar: { size: 40, iconSize: 26, dy: -10 },
    }),
    []
  );

  const measure = () => {
    const container = containerRef.current;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const activeIcon = iconRefs.current.get(tab);
    const iconRect = activeIcon?.getBoundingClientRect?.();
    if (!iconRect) return;
    const cfg = cfgByKey[tab] || { size: 44, dy: -8 };
    setIndicator({
      x: iconRect.left - containerRect.left + (iconRect.width - cfg.size) / 2,
      size: cfg.size,
      y: iconRect.top - containerRect.top + (cfg.dy || 0),
    });
  };

  useLayoutEffect(() => {
    measure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  useEffect(() => {
    const onResize = () => measure();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const prev = previousTabRef.current;
    if (prev === tab) return;

    const container = containerRef.current;
    const prevIcon = iconRefs.current.get(prev);
    const nextIcon = iconRefs.current.get(tab);
    if (!container || !prevIcon || !nextIcon) {
      previousTabRef.current = tab;
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const prevRect = prevIcon.getBoundingClientRect();
    const nextRect = nextIcon.getBoundingClientRect();
    const prevCfg = cfgByKey[prev] || { size: 44, dy: -8 };
    const nextCfg = cfgByKey[tab] || { size: 44, dy: -8 };
    const size = Math.max(prevCfg.size, nextCfg.size);

    const prevLeft = prevRect.left - containerRect.left + (prevRect.width - size) / 2;
    const nextLeft = nextRect.left - containerRect.left + (nextRect.width - size) / 2;
    const startLeft = prevLeft;
    const endLeft = nextLeft;
    const rangeLeft = Math.min(startLeft, endLeft);
    const rangeRight = Math.max(startLeft + size, endLeft + size);
    const yBase = Math.min(prevRect.top + (prevCfg.dy || 0), nextRect.top + (nextCfg.dy || 0));
    const y = yBase - containerRect.top;

    wobbleRef.current += 1;
    setTrail({ left: startLeft, width: size, opacity: 0.92, y, wobble: wobbleRef.current });
    window.requestAnimationFrame(() => {
      setTrail({
        left: rangeLeft,
        width: rangeRight - rangeLeft,
        opacity: 0.92,
        y,
        wobble: wobbleRef.current,
      });
    });
    window.setTimeout(() => setTrail((t) => (t ? { ...t, opacity: 0 } : t)), 980);
    window.setTimeout(() => setTrail(null), 1500);

    previousTabRef.current = tab;
  }, [cfgByKey, tab]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-200 bg-white/95 dark:border-gray-800 dark:bg-gray-950/92">
      <div className="mx-auto w-full max-w-4xl px-4 pt-0 md:px-6">
        <div ref={containerRef} className="relative flex items-end justify-between pb-0">
          {trail ? (
            <>
              <div
                key={`base-${trail.wobble}`}
                className="sars-liquid sars-liquid-wobble pointer-events-none absolute left-0 top-0 h-12 rounded-[34px] bg-blue-800/55 transition-[left,width,opacity] duration-[1000ms] ease-in-out"
                style={{
                  left: trail.left,
                  width: trail.width,
                  opacity: trail.opacity,
                  ['--y']: `${trail.y}px`,
                }}
              />
              <div
                key={`shine-${trail.wobble}`}
                className="sars-liquid sars-liquid-wobble pointer-events-none absolute left-0 top-0 h-12 rounded-[34px] bg-blue-500/35 transition-[left,width,opacity] duration-[1100ms] ease-in-out"
                style={{
                  left: trail.left + trail.width * 0.06,
                  width: Math.max(0, trail.width * 0.88),
                  opacity: trail.opacity * 0.75,
                  ['--y']: `${trail.y + 1}px`,
                }}
              />
            </>
          ) : null}

          {indicator ? (
            <div
              className="pointer-events-none absolute left-0 top-0 rounded-[34px] bg-blue-800 shadow-lg transition-[left,transform,width,height] duration-[1000ms] ease-in-out"
              style={{
                left: indicator.x,
                width: indicator.size,
                height: indicator.size,
                transform: `translateY(${indicator.y}px)`,
              }}
            />
          ) : null}

          {items.map((item) => {
            const Icon = item.icon;
            const active = tab === item.key;
            const isRaised = Boolean(item.raised);
            const cfg = cfgByKey[item.key] || { size: 44, iconSize: 22 };
            const circleSize = cfg.size;
            const iconSize = cfg.iconSize;

            return (
              <button
                key={item.key}
                ref={(el) => {
                  if (!el) return;
                  buttonRefs.current.set(item.key, el);
                }}
                onClick={() => onSelectTab(item.key)}
                className={`relative z-10 flex flex-1 flex-col items-center justify-center gap-0 pb-0.5 text-[13px] leading-[1] font-extrabold ${
                  isRaised ? '-translate-y-3' : ''
                }`}
                aria-label={item.label}
              >
                <span
                  ref={(el) => {
                    if (!el) return;
                    iconRefs.current.set(item.key, el);
                  }}
                  data-sars-icon
                  className={`inline-flex items-center justify-center rounded-[30px] transition ${
                    active
                      ? 'bg-transparent text-white'
                      : 'bg-gray-100 text-gray-800 shadow-sm hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800'
                  }`}
                  style={{ width: circleSize, height: circleSize }}
                >
                  <Icon size={iconSize} />
                </span>
                <span className={`-mt-1 ${active ? 'text-blue-800 dark:text-blue-200' : 'text-gray-600 dark:text-gray-400'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="pb-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
