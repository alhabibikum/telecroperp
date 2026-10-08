import { useState, useEffect, useRef } from 'react';

export const useAppZoom = () => {
  // Enforce minimum zoom of strictly 1.0 (100% normal scale). No zooming out below normal!
  const [zoomLevel, setZoomLevel] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('TELECORP_APP_ZOOM');
      if (saved) {
        const val = parseFloat(saved);
        if (!isNaN(val) && val >= 1.0 && val <= 2.5) {
          return val;
        }
      }
    } catch {}
    return 1.0;
  });

  const [showZoomIndicator, setShowZoomIndicator] = useState(false);
  const zoomLevelRef = useRef(zoomLevel);
  zoomLevelRef.current = zoomLevel;
  const hideTimerRef = useRef<any>(null);

  // Apply zoom to document.body and document.documentElement
  useEffect(() => {
    // Strictly clamp between 1.0 and 2.5
    const clamped = Math.max(1.0, Math.min(2.5, zoomLevel));
    const zoomStr = clamped.toString();
    try {
      (document.body.style as any).zoom = zoomStr;
      (document.documentElement.style as any).zoom = zoomStr;
      localStorage.setItem('TELECORP_APP_ZOOM', zoomStr);
    } catch (e) {
      console.warn('Failed to set zoom style:', e);
    }
  }, [zoomLevel]);

  const triggerIndicator = () => {
    setShowZoomIndicator(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setShowZoomIndicator(false);
    }, 1400);
  };

  const zoomIn = () => {
    setZoomLevel(prev => {
      const next = Math.min(2.5, Number((prev + 0.1).toFixed(2)));
      return next;
    });
    triggerIndicator();
  };

  const zoomOut = () => {
    setZoomLevel(prev => {
      // Cannot go below 1.0 (normal)
      const next = Math.max(1.0, Number((prev - 0.1).toFixed(2)));
      return next;
    });
    triggerIndicator();
  };

  const resetZoom = () => {
    setZoomLevel(1.0);
    triggerIndicator();
  };

  useEffect(() => {
    // 1. Keyboard shortcuts: Ctrl + +, Ctrl + -, Ctrl + 0
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '=' || e.key === '+' || e.code === 'NumpadAdd' || e.key === 'Add') {
          e.preventDefault();
          zoomIn();
        } else if (e.key === '-' || e.key === '_' || e.code === 'NumpadSubtract' || e.key === 'Subtract') {
          e.preventDefault();
          zoomOut();
        } else if (e.key === '0' || e.code === 'Numpad0') {
          e.preventDefault();
          resetZoom();
        }
      }
    };

    // 2. Trackpad / Precision Touchpad 2-Finger Pinch (ctrlKey + wheel)
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.04 : 0.96;
        setZoomLevel(prev => {
          // STRICT RULE: Cannot go below 1.0
          const next = Math.min(2.5, Math.max(1.0, Number((prev * factor).toFixed(2))));
          return next;
        });
        triggerIndicator();
      }
    };

    // 3. Touchscreen 2-Finger Pinch-to-zoom
    let touchStartDist = 0;
    let touchStartZoom = 1;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        touchStartDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        touchStartZoom = zoomLevelRef.current;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && touchStartDist > 0) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        if (currentDist > 0) {
          e.preventDefault();
          const scale = currentDist / touchStartDist;
          // STRICT RULE: Cannot go below 1.0
          const next = Math.min(2.5, Math.max(1.0, Number((touchStartZoom * scale).toFixed(2))));
          setZoomLevel(next);
          triggerIndicator();
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        touchStartDist = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  return {
    zoomLevel,
    setZoomLevel,
    showZoomIndicator,
    isZoomed: zoomLevel > 1.0,
    zoomIn,
    zoomOut,
    resetZoom
  };
};
