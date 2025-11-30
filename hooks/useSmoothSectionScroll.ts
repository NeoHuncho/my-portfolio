import { useEffect, useRef } from 'react';

const easeOutQuart = (t: number): number => 1 - Math.pow(1 - t, 4);

export function useSmoothSectionScroll(containerSelector: string) {
  const isAnimating = useRef(false);
  const currentSectionIndex = useRef(0);
  const cooldownTimeout = useRef<number | null>(null);

  useEffect(() => {
    const container = document.querySelector(containerSelector) as HTMLElement;
    if (!container) return;

    const sections = container.querySelectorAll('.scroll-section') as NodeListOf<HTMLElement>;
    if (sections.length === 0) return;

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
    const originalSectionSnapAligns = Array.from(sections, section => section.style.scrollSnapAlign);

    container.style.scrollSnapType = 'none';
    container.style.scrollBehavior = 'auto';
    sections.forEach(section => {
      section.style.scrollSnapAlign = 'none';
    });

    const scheduleAnimationEnd = () => {
      if (cooldownTimeout.current) {
        clearTimeout(cooldownTimeout.current);
      }
      cooldownTimeout.current = window.setTimeout(() => {
        isAnimating.current = false;
        cooldownTimeout.current = null;
      }, 350);
    };

    const animateToSection = (targetIndex: number) => {
      if (targetIndex < 0 || targetIndex >= sections.length) return;
      if (isAnimating.current) return;

      isAnimating.current = true;
      currentSectionIndex.current = targetIndex;

      const targetSection = sections[targetIndex];
      const start = container.scrollTop;
      const targetPosition = targetSection.offsetTop;
      const distance = targetPosition - start;
      const duration = 600; // ms - smooth animation
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutQuart(progress);

        container.scrollTop = start + distance * easedProgress;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          scheduleAnimationEnd();
        }
      };

      requestAnimationFrame(animate);
    };

    // Determine current section based on scroll position
    const getCurrentSection = (): number => {
      const scrollTop = container.scrollTop;
      const viewportHeight = container.clientHeight;
      
      for (let i = sections.length - 1; i >= 0; i--) {
        if (scrollTop >= sections[i].offsetTop - viewportHeight / 2) {
          return i;
        }
      }
      return 0;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      // If already animating, ignore
      if (isAnimating.current) return;
      
      // Update current section based on actual position
      currentSectionIndex.current = getCurrentSection();

      if (e.deltaY > 0) {
        // Scrolling down
        animateToSection(currentSectionIndex.current + 1);
      } else if (e.deltaY < 0) {
        // Scrolling up
        animateToSection(currentSectionIndex.current - 1);
      }
    };

    // Keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnimating.current) return;
      
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
      if (cooldownTimeout.current) {
        clearTimeout(cooldownTimeout.current);
      }
    };
  }, [containerSelector]);
}
