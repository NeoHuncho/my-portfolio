import { Fragment } from 'react';

/** Renders `backticked` parts of ticket copy as inline code. */
export default function RichText({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/g);
  return (
    <>
      {parts.map((part, index) =>
        part.startsWith('`') && part.endsWith('`') && part.length > 2 ? (
          <code
            // Parts are positional and never reordered.
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            className="rounded bg-surface-3 px-1 py-px font-mono text-[0.86em] text-ink"
          >
            {part.slice(1, -1)}
          </code>
        ) : (
          // eslint-disable-next-line react/no-array-index-key
          <Fragment key={index}>{part}</Fragment>
        )
      )}
    </>
  );
}
