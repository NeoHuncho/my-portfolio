import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { FiX } from 'react-icons/fi';

type PhotoLightboxProps = {
  src: string;
  alt: string;
  closeLabel: string;
  onClose: () => void;
};

/**
 * My photo, big but not filling the screen, over a dimmed page: at most
 * 440 pixels wide, and never most of the screen's width or height. A modal dialog, in the page's top layer, so the
 * hero's animated text never holds it inside its own box. Escape, the close
 * button or a click anywhere round the photo puts it away.
 */
export default function PhotoLightbox({ src, alt, closeLabel, onClose }: PhotoLightboxProps) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = dialog.current;
    // The page stops scrolling while it is open: see `dialog[data-scroll-lock]` in globals.css,
    // which leaves the body's own style to the search palette.
    element?.showModal();
    return () => element?.close();
  }, []);

  return (
    // A click on the dialog itself, not the photo, is a click on the backdrop round it.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={dialog}
      aria-label={alt}
      data-scroll-lock
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      className="pointer-events-auto m-auto max-h-none max-w-none cursor-zoom-out overflow-visible bg-transparent p-0 backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <figure className="relative m-0 animate-fade-up cursor-default">
        <Image
          src={src}
          alt={alt}
          width={1122}
          height={1402}
          sizes="440px"
          className="h-auto w-[min(440px,80vw,calc(70svh*1122/1402))] rounded-2xl shadow-2xl ring-1 ring-line-strong"
        />
        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className="absolute -right-3 -top-3 grid size-8 cursor-pointer place-items-center rounded-full border border-line-strong bg-surface text-muted shadow-lg transition hover:text-ink"
        >
          <FiX aria-hidden />
        </button>
      </figure>
    </dialog>
  );
}
