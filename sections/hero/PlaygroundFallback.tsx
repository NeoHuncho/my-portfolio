import { cx } from '@lib/cx';
import { CLAUDE_PATH, CODEX_PATH } from './brandMarks';

/** Static stand-in for the 3D desk, without WebGL or when the visitor prefers reduced motion. */
export default function PlaygroundFallback({ note }: { note?: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden={!note}>
      <div className="absolute inset-y-0 right-0 w-full max-lg:[&>*]:scale-75 lg:w-[58%]">
        <div className="absolute left-[48%] top-[24%] w-44 -translate-x-1/2 rotate-[-8deg] rounded-lg bg-[#f4f2ed] p-3 pl-4 text-[#17171b] shadow-2xl shadow-black/60">
          <span className="absolute inset-y-0 left-0 w-1.5 rounded-l-lg bg-[#5b9cff]" />
          <p className="font-mono text-xs font-semibold text-[#5b9cff]">FEAT-142</p>
          <p className="mt-1 text-sm font-semibold leading-snug">Bulk reassign deliveries</p>
        </div>
        <div className="absolute left-[84%] top-[66%] grid size-14 -translate-x-1/2 rotate-[6deg] place-items-center rounded-xl bg-accent text-xl font-semibold text-bg shadow-xl shadow-black/60">
          /
        </div>
        {/* Claude and Codex together over one glowing dock */}
        <div className="absolute left-[30%] top-[46%] flex size-36 -translate-x-1/2 items-center justify-center gap-1 rounded-full bg-[#2a2b33] shadow-2xl shadow-black/60 ring-2 ring-[#9d7bd8]/70 [box-shadow:0_0_40px_-6px_rgb(125_107_255/0.45),inset_0_0_30px_rgb(232_135_95/0.25)]">
          <svg viewBox="0 0 24 24" className="size-14">
            <path fill="#d97757" d={CLAUDE_PATH} />
          </svg>
          <svg viewBox="0 0 24 24" className="size-12">
            <defs>
              <linearGradient id="fallback-codex" x1="0" x2="0" y1="0" y2="1">
                <stop stopColor="#b1a7ff" />
                <stop offset="1" stopColor="#3941ff" />
              </linearGradient>
            </defs>
            <path fill="url(#fallback-codex)" fillRule="evenodd" d={CODEX_PATH} />
          </svg>
        </div>
        {/* The mountain, a Swiss flag on its summit */}
        <div className="absolute left-[86%] top-[34%] -translate-x-1/2 border-x-[34px] border-b-[52px] border-x-transparent border-b-[#5f6b7d] drop-shadow-xl" />
        <div className="absolute left-[86%] top-[calc(34%-26px)] h-7 w-px bg-[#c3c6cc]" />
        <svg viewBox="0 0 32 32" className="absolute left-[86%] top-[calc(34%-26px)] size-3.5">
          <rect width="32" height="32" fill="#da291c" />
          <path fill="#fff" d="M13 6h6v7h7v6h-7v7h-6v-7H6v-6h7z" />
        </svg>
        {/* British and French, in two speech bubbles */}
        <div className="absolute left-[64%] top-[80%] flex -translate-x-1/2 gap-1 drop-shadow-xl">
          <svg
            viewBox="0 0 60 30"
            preserveAspectRatio="none"
            className="h-8 w-12 -rotate-6 rounded-md border-[3px] border-[#f4f2ed] bg-[#f4f2ed]"
          >
            <clipPath id="fallback-uk">
              <path d="M30 15h30v15zv15H0zH0V0zV0h30z" />
            </clipPath>
            <path fill="#012169" d="M0 0v30h60V0z" />
            <path stroke="#fff" strokeWidth="6" d="m0 0 60 30m0-30L0 30" />
            <path
              stroke="#c8102e"
              strokeWidth="4"
              clipPath="url(#fallback-uk)"
              d="m0 0 60 30m0-30L0 30"
            />
            <path stroke="#fff" strokeWidth="10" d="M30 0v30M0 15h60" />
            <path stroke="#c8102e" strokeWidth="6" d="M30 0v30M0 15h60" />
          </svg>
          <svg
            viewBox="0 0 3 2"
            preserveAspectRatio="none"
            className="mt-3 h-8 w-12 rotate-6 rounded-md border-[3px] border-[#f4f2ed] bg-[#f4f2ed]"
          >
            <path fill="#0055a4" d="M0 0h1v2H0z" />
            <path fill="#fff" d="M1 0h1v2H1z" />
            <path fill="#ef4135" d="M2 0h1v2H2z" />
          </svg>
        </div>
        {/* The night shift: a bedside clock, its scheduled runs done */}
        <div className="absolute left-[66%] top-[18%] w-24 -translate-x-1/2 rotate-[3deg] rounded-xl bg-[#e9e7e2] p-1.5 shadow-xl shadow-black/60">
          <div className="rounded-lg bg-[#07080c] px-2 py-1.5">
            <p className="font-mono text-sm font-semibold text-accent">☾ 03:00</p>
            <div className="mt-1 flex gap-1">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={cx('h-1 flex-1 rounded-full', i < 2 ? 'bg-ok' : 'bg-[#1c1e26]')}
                />
              ))}
            </div>
          </div>
        </div>
        {/* Walking pad */}
        <div className="absolute left-[40%] top-[76%] h-10 w-28 -translate-x-1/2 rotate-[-4deg] rounded-xl bg-[#2a2b31] p-1.5 shadow-xl shadow-black/60">
          <div className="h-full rounded-lg bg-[repeating-linear-gradient(90deg,#16171b_0_6px,#1d1e23_6px_12px)]" />
        </div>
      </div>
      {note && <p className="absolute bottom-6 right-6 font-mono text-xs text-faint">{note}</p>}
    </div>
  );
}
