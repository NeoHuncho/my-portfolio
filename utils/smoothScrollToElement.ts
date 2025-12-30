const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

/**
 * Smoothly scroll to an element - works on Chrome where native smooth scroll + snap doesn't work
 */
export const smoothScrollToElement = (
  elementId: string,
  containerSelector = '.scroll-container',
  duration = 500
) => {
  const container = document.querySelector(containerSelector) as HTMLElement;
  const element = document.getElementById(elementId);

  if (!container || !element) {
    return;
  }

  const start = container.scrollTop;
  const targetPosition = element.offsetTop;
  const distance = targetPosition - start;

  // Skip if already at target
  if (Math.abs(distance) < 1) {
    return;
  }

  let startTime: number | null = null;

  const animate = (currentTime: number) => {
    if (startTime === null) {
      startTime = currentTime;
    }

    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutCubic(progress);

    // Round to avoid sub-pixel jitter
    container.scrollTop = Math.round(start + distance * easedProgress);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      // Ensure we land exactly on target
      container.scrollTop = targetPosition;
    }
  };

  requestAnimationFrame(animate);
};
