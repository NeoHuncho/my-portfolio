import { Children, type ReactNode, useEffect, useRef, useState } from 'react';
import { cx } from '@lib/cx';

type SwipeRowProps = {
  children: ReactNode;
  /** Names the list for screen readers. */
  label: string;
  /** The layout from `sm` up, where the row is not a swipe: a grid, a stack… */
  className?: string;
  /** Classes on every item, at every size. */
  itemClassName?: string;
  /** Item width on phones; a little less than the screen, so the next one peeks in. */
  itemWidth?: string;
  /** On phones the row bleeds to the screen edges: undo the padding it sits in. */
  bleed?: string;
  /** Spacing round the dots. */
  dotsClassName?: string;
};

/**
 * Side by side on phones, one swipe apart, with dots for where you are; laid
 * out by `className` from `sm` up. Keeps a long list to the height of one item.
 */
export default function SwipeRow({
  children,
  label,
  className,
  itemClassName,
  itemWidth = 'max-sm:w-[82%]',
  bleed = 'max-sm:-mx-4 max-sm:px-4 max-sm:scroll-px-4',
  dotsClassName = 'mt-3',
}: SwipeRowProps) {
  const items = Children.toArray(children);
  const listRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const list = listRef.current;
    if (!list) {
      return undefined;
    }
    const onScroll = () => {
      const first = list.firstElementChild as HTMLElement | null;
      if (!first) {
        return;
      }
      const step = first.offsetWidth + parseFloat(getComputedStyle(list).columnGap || '0');
      // At the end of the row the last item may not reach the start: count it as reached.
      const atEnd = list.scrollLeft + list.clientWidth >= list.scrollWidth - 4;
      setActive(atEnd ? items.length - 1 : Math.round(list.scrollLeft / step));
    };
    list.addEventListener('scroll', onScroll, { passive: true });
    return () => list.removeEventListener('scroll', onScroll);
  }, [items.length]);

  return (
    <div className="min-w-0">
      <ul
        ref={listRef}
        aria-label={label}
        className={cx(
          'no-scrollbar max-sm:flex max-sm:snap-x max-sm:snap-mandatory max-sm:gap-3 max-sm:overflow-x-auto max-sm:overscroll-x-contain',
          bleed,
          className
        )}
      >
        {items.map((item, index) => (
          <li
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            className={cx('max-sm:shrink-0 max-sm:snap-start', itemWidth, itemClassName)}
          >
            {item}
          </li>
        ))}
      </ul>
      {items.length > 1 && (
        <div aria-hidden className={cx('flex justify-center gap-1.5 sm:hidden', dotsClassName)}>
          {items.map((_, index) => (
            <span
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              className={cx(
                'h-1.5 rounded-full transition-all',
                index === active ? 'w-4 bg-ink' : 'w-1.5 bg-line-strong'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
