import { useEffect, useRef } from 'react';

// Smoother easing - cubic bezier approximation for a more natural feel
const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

export function useSmoothSectionScroll(containerSelector: string) {
  const isAnimating = useRef(false);
  const currentSectionIndex = useRef(0);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    const container = document.querySelector(containerSelector) as HTMLElement;
    if (!container) {
      return;
    }

    const sections = container.querySelectorAll('.scroll-section') as NodeListOf<HTMLElement>;
    if (sections.length === 0) {
      return;
    }

    // Detect if browser is Chrome (doesn't support smooth scroll with snap)
    const isChrome = /Chrome/.test(navigator.userAgent) && !/Edg/.test(navigator.userAgent);

    // Detect mobile
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    // On Chrome mobile, use a simpler approach - just let native scroll-snap handle it
    if (isChrome && isMobile) {
      // Keep scroll-snap enabled for Chrome mobile - it works better than custom handling
      return;
    }

    if (!isChrome) {
      // Firefox and Safari handle this natively
      return;
    }

    // Only apply custom scroll handling for Chrome desktop
    // Disable CSS scroll-snap and smooth scrolling for Chrome so the manual animation can start immediately
    const originalScrollSnapType = container.style.scrollSnapType;
    const originalScrollBehavior = container.style.scrollBehavior;
    const originalSectionSnapAligns = Array.from(
      sections,
      (section) => section.style.scrollSnapAlign
    );

    container.style.scrollSnapType = 'none';
    container.style.scrollBehavior = 'auto';
    sections.forEach((section) => {
      section.style.scrollSnapAlign = 'none';
    });

    const animateToSection = (targetIndex: number) => {
      if (targetIndex < 0 || targetIndex >= sections.length) {
        return;
      }
      if (isAnimating.current) {
        return;
      }

      // Cancel any pending animation frame
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }

      isAnimating.current = true;
      currentSectionIndex.current = targetIndex;

      const targetSection = sections[targetIndex];
      const start = container.scrollTop;
      const targetPosition = targetSection.offsetTop;
      const distance = targetPosition - start;

      // Skip animation if distance is negligible
      if (Math.abs(distance) < 1) {
        isAnimating.current = false;
        return;
      }

      const duration = 500; // Slightly faster for snappier feel
      let startTime: number | null = null;

      const animate = (currentTime: number) => {
        if (startTime === null) {
          startTime = currentTime;
        }

        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutCubic(progress);

        // Round to avoid sub-pixel jitter
        const newScrollTop = Math.round(start + distance * easedProgress);
        container.scrollTop = newScrollTop;

        if (progress < 1) {
          animationFrameId.current = requestAnimationFrame(animate);
        } else {
          // Ensure we land exactly on target
          container.scrollTop = targetPosition;
          isAnimating.current = false;
          animationFrameId.current = null;
        }
      };

      animationFrameId.current = requestAnimationFrame(animate);
    };

    // Determine current section based on scroll position
    const getCurrentSection = (): number => {
      const { scrollTop } = container;
      const viewportHeight = container.clientHeight;

      for (let i = sections.length - 1; i >= 0; i--) {
        if (scrollTop >= sections[i].offsetTop - viewportHeight / 2) {
          return i;
        }
      }
      return 0;
    };

    // Accumulate wheel delta for better trackpad support
    let accumulatedDelta = 0;
    let wheelTimeout: number | null = null;
    const DELTA_THRESHOLD = 50; // Minimum delta to trigger scroll

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      // If already animating, ignore
      if (isAnimating.current) {
        return;
      }

      // Accumulate delta for smoother trackpad handling
      accumulatedDelta += e.deltaY;

      // Clear previous timeout
      if (wheelTimeout) {
        clearTimeout(wheelTimeout);
      }

      // Reset accumulated delta after inactivity
      wheelTimeout = window.setTimeout(() => {
        accumulatedDelta = 0;
      }, 150);

      // Only trigger if threshold is reached
      if (Math.abs(accumulatedDelta) < DELTA_THRESHOLD) {
        return;
      }

      // Update current section based on actual position
      currentSectionIndex.current = getCurrentSection();

      if (accumulatedDelta > 0) {
        // Scrolling down
        animateToSection(currentSectionIndex.current + 1);
      } else if (accumulatedDelta < 0) {
        // Scrolling up
        animateToSection(currentSectionIndex.current - 1);
      }

      // Reset after triggering
      accumulatedDelta = 0;
    };

    // Keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnimating.current) {
        return;
      }

      currentSectionIndex.current = getCurrentSection();

      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        animateToSection(currentSectionIndex.current + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        animateToSection(currentSectionIndex.current - 1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        animateToSection(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        animateToSection(sections.length - 1);
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      document.removeEventListener('keydown', handleKeyDown);
      container.style.scrollSnapType = originalScrollSnapType;
      container.style.scrollBehavior = originalScrollBehavior;
      sections.forEach((section, index) => {
        section.style.scrollSnapAlign = originalSectionSnapAligns[index];
      });
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [containerSelector]);
}
