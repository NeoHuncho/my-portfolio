const easeOutQuart = (t: number): number => 1 - Math.pow(1 - t, 4);

/**
 * Smoothly scroll to an element - works on Chrome where native smooth scroll + snap doesn't work
 */
export const smoothScrollToElement = (
  elementId: string,
  containerSelector: string = '.scroll-container',
  duration: number = 600
) => {
  const container = document.querySelector(containerSelector) as HTMLElement;
  const element = document.getElementById(elementId);
  
  if (!container || !element) return;

  const start = container.scrollTop;
  const targetPosition = element.offsetTop;
  const distance = targetPosition - start;
  const startTime = performance.now();

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutQuart(progress);

    container.scrollTop = start + distance * easedProgress;

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };

  requestAnimationFrame(animate);
};
