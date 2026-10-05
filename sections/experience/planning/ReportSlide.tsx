import { type LocalizedString } from '@config/types';
import { colors, easeInOut, phase, pulse, type SlideProps } from './motion';

/**
 * A PDF report being put together: the first page fills in while the
 * sections tick off, then the download is ready. No real layout or copy.
 */
const READY_AT = 3;
export const REPORT_END = 4.2;

const sections: Array<{ label: LocalizedString; at: number }> = [
  { label: { en: 'Summary', fr: 'Synthèse' }, at: 0.7 },
  { label: { en: 'Pillars and income', fr: 'Piliers et revenus' }, at: 1.4 },
  { label: { en: 'Cash flow', fr: 'Cash-flow' }, at: 2.1 },
  { label: { en: 'Allocation', fr: 'Allocation' }, at: 2.7 },
];

const copy = {
  report: { en: 'PDF report', fr: 'Rapport PDF' },
  pages: { en: '12 pages', fr: '12 pages' },
  title: { en: 'Financial plan', fr: 'Plan financier' },
  generating: { en: 'Generating…', fr: 'Génération…' },
  download: { en: 'Download PDF', fr: 'Télécharger' },
  ready: { en: 'Ready', fr: 'Prêt' },
} satisfies Record<string, LocalizedString>;

const pageBars = [0.42, 0.5, 0.58, 0.66, 0.74, 0.62, 0.55, 0.48];

/** The front page, drawn in a 120 × 170 box and scaled to fit. */
function Page({ t, title }: { t: number; title: string }) {
  const header = phase(t, 0.25, 0.4);
  const chart = phase(t, 1, 0.8);
  const donut = phase(t, 1.7, 0.7, easeInOut) * 2 * Math.PI * 9;
  const lineWidths = [66, 58, 62, 40];
  const lines = lineWidths.map((_, i) => phase(t, 2.1 + i * 0.12, 0.4));
  return (
    <g>
      <rect width={120} height={170} rx={3} fill={colors.paper} />
      <g opacity={header}>
        <rect x={10} y={10} width={9} height={9} rx={2} fill={colors.p1} />
        <rect x={23} y={12.5} width={30} height={4} rx={2} fill="#b5b5b8" />
        <rect x={92} y={12.5} width={18} height={4} rx={2} fill="#cfcfd1" />
        <text x={10} y={36} fontSize={9.5} fontWeight={700} fill={colors.paperInk}>
          {title}
        </text>
        <rect x={10} y={41} width={64} height={3} rx={1.5} fill="#b5b5b8" />
      </g>

      {/* Stacked pillar bars. */}
      <rect
        x={10}
        y={52}
        width={100}
        height={46}
        rx={3}
        fill="#dcdcd9"
        opacity={phase(t, 0.8, 0.3)}
      />
      {pageBars.map((value, i) => {
        const grow = phase(t, 1 + i * 0.06, 0.5) * chart;
        const height = value * 38 * grow;
        const x = 16 + i * 11.6;
        const split = [0.4, 0.35, 0.25];
        let y = 94;
        return (
          // Bars are a fixed decoration.
          // eslint-disable-next-line react/no-array-index-key
          <g key={i}>
            {split.map((part, k) => {
              const piece = height * part;
              y -= piece;
              return (
                <rect
                  // eslint-disable-next-line react/no-array-index-key
                  key={k}
                  x={x}
                  y={y}
                  width={7}
                  height={Math.max(0, piece - 0.6)}
                  fill={[colors.p1, colors.p2, colors.p3][k]}
                />
              );
            })}
          </g>
        );
      })}

      {/* Donut and text. */}
      <g transform="rotate(-90 26 120)">
        <circle cx={26} cy={120} r={9} fill="none" stroke="#d2d2d0" strokeWidth={5} />
        <circle
          cx={26}
          cy={120}
          r={9}
          fill="none"
          stroke={colors.p2}
          strokeWidth={5}
          strokeDasharray={`${donut} 100`}
        />
        <circle
          cx={26}
          cy={120}
          r={9}
          fill="none"
          stroke={colors.p1}
          strokeWidth={5}
          strokeDasharray={`${Math.max(0, donut - 30)} 100`}
        />
      </g>
      {lineWidths.map((width, i) => (
        <rect
          key={width}
          x={44}
          y={111 + i * 6}
          width={width * lines[i]}
          height={2.6}
          rx={1.3}
          fill="#bdbdbf"
        />
      ))}
      <rect x={10} y={142} width={100 * lines[3]} height={0.8} fill="#cfcfd1" />
      <rect x={10} y={150} width={46 * lines[3]} height={2.6} rx={1.3} fill="#cfcfd1" />
      <text x={110} y={163} fontSize={5.5} textAnchor="end" fill="#9b9ba3" opacity={lines[3]}>
        1 / 12
      </text>
    </g>
  );
}

export default function ReportSlide({ t, w, h, locale }: SlideProps) {
  const narrow = w < 420;
  const pageHeight = h - (narrow ? 18 : 26);
  const scale = pageHeight / 170;
  const pageWidth = 120 * scale;
  const px = narrow ? 18 : 34;
  const py = (h - pageHeight) / 2;
  const fan = phase(t, 0.1, 0.8);
  const spread = phase(t, READY_AT, 0.6, easeInOut);
  const progress = phase(t, 0.2, READY_AT - 0.2, easeInOut);
  const ready = t >= READY_AT;

  const x0 = px + pageWidth + (narrow ? 24 : 40);
  const x1 = w - 12;
  const rowGap = narrow ? 16 : 19;
  const listTop = narrow ? 34 : 44;
  const barY = listTop + sections.length * rowGap + (narrow ? 2 : 6);

  return (
    <g>
      {/* Page stack. */}
      {[
        { angle: -7, fill: '#9b9ba3', opacity: 0.35 },
        { angle: 5, fill: '#c9c9cc', opacity: 0.55 },
      ].map((sheet) => (
        <rect
          key={sheet.angle}
          x={px}
          y={py}
          width={pageWidth}
          height={pageHeight}
          rx={3}
          fill={sheet.fill}
          opacity={sheet.opacity * fan}
          transform={`rotate(${sheet.angle * fan * (1 + spread * 0.5)} ${px + pageWidth / 2} ${py + pageHeight})`}
        />
      ))}
      <g transform={`translate(${px} ${py}) scale(${scale})`}>
        <Page t={t} title={copy.title[locale]} />
      </g>

      {/* Generation status. */}
      <text x={x0} y={20} fontSize={8.5} letterSpacing="0.08em" className="fill-faint font-mono">
        {copy.report[locale].toUpperCase()}
      </text>
      <text x={x1} y={20} fontSize={8.5} textAnchor="end" className="fill-faint font-mono">
        {copy.pages[locale]}
      </text>
      {sections.map((section, i) => {
        const done = phase(t, section.at, 0.3);
        const y = listTop + i * rowGap;
        return (
          <g key={section.label.en}>
            <circle
              cx={x0 + 6}
              cy={y}
              r={6}
              fill={colors.ok}
              fillOpacity={0.9 * done}
              stroke={done > 0 ? colors.ok : 'rgb(255 255 255 / 0.2)'}
            />
            <path
              d={`M${x0 + 3.2} ${y} l2 2 l3.6 -4`}
              fill="none"
              stroke="#0b0b0d"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - done}
            />
            <text
              x={x0 + 18}
              y={y + 3.3}
              fontSize={narrow ? 9 : 10}
              className={done > 0.5 ? 'fill-ink' : 'fill-faint'}
              style={{ transition: 'fill 0.3s' }}
            >
              {section.label[locale]}
            </text>
          </g>
        );
      })}

      {/* Progress and download. */}
      <rect x={x0} y={barY} width={x1 - x0} height={4} rx={2} fill="#23232a" />
      <rect
        x={x0}
        y={barY}
        width={(x1 - x0) * progress}
        height={4}
        rx={2}
        fill={ready ? colors.ok : colors.p1}
        style={{ transition: 'fill 0.3s' }}
      />
      {narrow ? (
        <text
          x={x0}
          y={barY + 16}
          fontSize={8.5}
          className="font-mono"
          fill={ready ? colors.ok : '#9b9ba3'}
        >
          {ready ? `${copy.ready[locale]} · PDF` : `${Math.round(progress * 100)}%`}
        </text>
      ) : (
        <ReadyButton
          x={x0}
          y={barY + 14}
          t={t}
          ready={ready}
          label={
            ready
              ? copy.download[locale]
              : `${copy.generating[locale]} ${Math.round(progress * 100)}%`
          }
        />
      )}
    </g>
  );
}

function ReadyButton({
  x,
  y,
  t,
  ready,
  label,
}: {
  x: number;
  y: number;
  t: number;
  ready: boolean;
  label: string;
}) {
  const width = 132;
  const height = 24;
  const ring = pulse(t, READY_AT + 0.1, 0.9);
  const grow = phase(t, READY_AT + 0.1, 0.9);
  return (
    <g>
      {ring > 0 && (
        <rect
          x={x - grow * 6}
          y={y - grow * 6}
          width={width + grow * 12}
          height={height + grow * 12}
          rx={12 + grow * 6}
          fill="none"
          stroke={colors.p1}
          strokeOpacity={ring * 0.6}
        />
      )}
      <rect
        x={x + 0.5}
        y={y + 0.5}
        width={width - 1}
        height={height - 1}
        rx={12}
        fill={ready ? colors.p1 : '#131316'}
        stroke={ready ? colors.p1 : 'rgb(255 255 255 / 0.16)'}
        style={{ transition: 'fill 0.3s, stroke 0.3s' }}
      />
      {ready && (
        <path
          d={`M${x + 14} ${y + 7} v8 m-3.5 -3.5 l3.5 3.5 l3.5 -3.5`}
          fill="none"
          stroke="#0b0b0d"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      <text
        x={ready ? x + 26 : x + width / 2}
        y={y + 15.5}
        fontSize={9.5}
        fontWeight={ready ? 600 : 400}
        textAnchor={ready ? 'start' : 'middle'}
        className={ready ? 'font-mono' : 'fill-muted font-mono'}
        fill={ready ? '#0b0b0d' : undefined}
      >
        {label}
      </text>
    </g>
  );
}
