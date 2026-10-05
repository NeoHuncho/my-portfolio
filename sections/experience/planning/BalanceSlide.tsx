import { type LocalizedString } from '@config/types';
import { chf, colors, easeInOut, lerp, phase, pulse, type SlideProps } from './motion';

/**
 * A self-employed client's balance sheet next to the operating account.
 * The depreciation in the account then lowers equipment and equity on the
 * balance sheet, which stays balanced. All figures are made up (CHF 1000s).
 */
const DEPRECIATION_AT = 3.2;
export const BALANCE_END = 4.4;

type Segment = { label: LocalizedString; value: number; after?: number; color: string };

const assets: Segment[] = [
  {
    label: { en: 'Equipment', fr: 'Équipement' },
    value: 200,
    after: 180,
    color: colors.p2,
  },
  { label: { en: 'Receivables', fr: 'Créances' }, value: 70, color: 'rgb(91 156 255 / 0.55)' },
  { label: { en: 'Cash', fr: 'Liquidités' }, value: 90, color: colors.p3 },
];

const liabilities: Segment[] = [
  {
    label: { en: 'Equity', fr: 'Fonds propres' },
    value: 170,
    after: 150,
    color: colors.p1,
  },
  { label: { en: 'Loan', fr: 'Emprunt' }, value: 140, color: colors.violet },
  { label: { en: 'Payables', fr: 'Dettes' }, value: 50, color: 'rgb(167 139 250 / 0.5)' },
];

type Step = { label: LocalizedString; short: LocalizedString; value: number; color: string };

const steps: Step[] = [
  {
    label: { en: 'Revenue', fr: 'Recettes' },
    short: { en: 'Rev.', fr: 'Rec.' },
    value: 420,
    color: colors.p3,
  },
  {
    label: { en: 'Costs', fr: 'Charges' },
    short: { en: 'Costs', fr: 'Charg.' },
    value: -250,
    color: colors.red,
  },
  {
    label: { en: 'Deprec.', fr: 'Amort.' },
    short: { en: 'Depr.', fr: 'Amort.' },
    value: -20,
    color: colors.gold,
  },
  {
    label: { en: 'Interest', fr: 'Intérêts' },
    short: { en: 'Int.', fr: 'Int.' },
    value: -8,
    color: colors.violet,
  },
  {
    label: { en: 'Result', fr: 'Résultat' },
    short: { en: 'Net', fr: 'Rés.' },
    value: 142,
    color: colors.p1,
  },
];

/** Where each waterfall bar starts and ends; the last one is the total. */
const spans = steps.map((step, i) => {
  if (i === steps.length - 1) {
    return { from: 0, to: step.value };
  }
  const from = steps.slice(0, i).reduce((sum, previous) => sum + previous.value, 0);
  return { from, to: from + step.value };
});

const copy = {
  balance: { en: 'Balance sheet', fr: 'Bilan' },
  account: { en: 'Operating account', fr: "Compte d'exploitation" },
  assets: { en: 'Assets', fr: 'Actifs' },
  liabilities: { en: 'Liabilities', fr: 'Passifs' },
  liabilitiesShort: { en: 'Liab.', fr: 'Passifs' },
  cashFlow: { en: 'Cash flow', fr: 'Cash-flow' },
  result: { en: 'Result', fr: 'Résultat' },
} satisfies Record<string, LocalizedString>;

const DEPRECIATION_STEP = 2;

export default function BalanceSlide({ t, w, h, locale }: SlideProps) {
  const narrow = w < 420;
  const depreciate = phase(t, DEPRECIATION_AT, 0.8, easeInOut);
  const flash = pulse(t, DEPRECIATION_AT - 0.2, 1.2);

  /* Balance sheet. */
  const top = 34;
  const bottom = h - 30;
  const scale = (bottom - top) / 360;
  const columnWidth = narrow ? 34 : 76;
  const gap = narrow ? 18 : 30;
  const columns = [
    { title: copy.assets[locale], segments: assets, x: 14 },
    {
      title: (narrow ? copy.liabilitiesShort : copy.liabilities)[locale],
      segments: liabilities,
      x: 14 + columnWidth + gap,
    },
  ];
  const panelRight = 14 + columnWidth * 2 + gap;
  const total = lerp(360, 340, depreciate);
  const balanced = phase(t, 1.45, 0.4);

  /* Operating account. */
  const x0 = panelRight + (narrow ? 22 : 34);
  const x1 = w - 12;
  const slot = (x1 - x0) / steps.length;
  const barWidth = slot * 0.58;
  const wfTop = 44;
  const wfBottom = h - 30;
  const level = (value: number) => wfBottom - (value / 440) * (wfBottom - wfTop);
  const result = 142 * phase(t, 2.5, 0.8);
  const cashFlow = 162 * phase(t, 2.5, 0.8);

  const bars = steps.map((step, i) => ({
    ...step,
    ...spans[i],
    grow: phase(t, 0.9 + i * 0.32, 0.5),
  }));

  return (
    <g>
      <text x={14} y={20} fontSize={8.5} letterSpacing="0.08em" className="fill-faint font-mono">
        {copy.balance[locale].toUpperCase()}
        {!narrow && ' · 31.12'}
      </text>

      {columns.map((column, c) => {
        let stacked = 0;
        return (
          <g key={column.title}>
            {column.segments.map((segment, k) => {
              const grow = phase(t, 0.15 + (c * 3 + k) * 0.12, 0.45);
              const full = segment.after
                ? lerp(segment.value, segment.after, depreciate)
                : segment.value;
              const value = full * grow;
              const y0 = bottom - stacked * scale;
              stacked += value;
              const y1 = bottom - stacked * scale;
              const height = Math.max(0, y0 - y1 - 1.5);
              return (
                <g key={segment.label.en}>
                  {segment.after && flash > 0 && (
                    <rect
                      x={column.x - 2.5}
                      y={y1 - 2.5}
                      width={columnWidth + 5}
                      height={height + 5}
                      rx={5}
                      fill="none"
                      stroke={colors.gold}
                      strokeOpacity={flash}
                    />
                  )}
                  <rect
                    x={column.x}
                    y={y1}
                    width={columnWidth}
                    height={height}
                    rx={3}
                    fill={segment.color}
                    fillOpacity={0.85}
                  />
                  {!narrow && height > 15 && (
                    <text
                      x={column.x + 7}
                      y={y1 + Math.min(height / 2 + 3, 14)}
                      fontSize={8.5}
                      fill="#0b0b0d"
                      fillOpacity={0.8}
                      fontWeight={500}
                      opacity={grow}
                    >
                      {segment.label[locale]}
                    </text>
                  )}
                </g>
              );
            })}
            <text
              x={column.x + columnWidth / 2}
              y={h - 17}
              fontSize={narrow ? 8 : 8.5}
              textAnchor="middle"
              className="fill-muted font-mono"
            >
              {column.title}
            </text>
            <text
              x={column.x + columnWidth / 2}
              y={h - 6}
              fontSize={8.5}
              textAnchor="middle"
              className="fill-faint font-mono"
            >
              {Math.round(total * phase(t, 0.3, 1.2))}k
            </text>
          </g>
        );
      })}

      {/* Balanced. */}
      <g
        transform={`translate(${14 + columnWidth + gap / 2} ${(top + bottom) / 2 + 10}) scale(${balanced})`}
        opacity={balanced}
      >
        <circle r={narrow ? 7 : 9} fill="#1a1a1f" stroke={colors.ok} strokeWidth={1.2} />
        <path
          d={narrow ? 'M-3 -1.5 h6 M-3 1.5 h6' : 'M-3.5 -1.8 h7 M-3.5 1.8 h7'}
          stroke={colors.ok}
          strokeWidth={1.3}
          strokeLinecap="round"
        />
      </g>
      {flash > 0 &&
        columns.map((column) => (
          <text
            key={column.title}
            x={column.x + columnWidth / 2}
            y={bottom - total * scale - 6}
            fontSize={narrow ? 8 : 9}
            textAnchor="middle"
            className="font-mono"
            fill={colors.gold}
            opacity={flash}
          >
            −20k
          </text>
        ))}

      <line
        x1={x0 - (narrow ? 11 : 17)}
        x2={x0 - (narrow ? 11 : 17)}
        y1={12}
        y2={h - 12}
        stroke="rgb(255 255 255 / 0.08)"
      />

      {/* Operating account as a waterfall. */}
      <text x={x0} y={20} fontSize={8.5} letterSpacing="0.08em" className="fill-faint font-mono">
        {(narrow ? copy.result : copy.account)[locale].toUpperCase()}
      </text>
      <text x={x1} y={20} fontSize={narrow ? 9.5 : 9} textAnchor="end" className="font-mono">
        {!narrow && (
          <>
            <tspan className="fill-faint">{copy.cashFlow[locale]} </tspan>
            <tspan className="fill-ink">{chf(cashFlow)}k</tspan>
            <tspan className="fill-faint">
              {'  ·  '}
              {copy.result[locale]}{' '}
            </tspan>
          </>
        )}
        <tspan fill={colors.p1} fontWeight={600}>
          {chf(result)}k
        </tspan>
      </text>

      <line x1={x0} x2={x1} y1={wfBottom} y2={wfBottom} stroke="rgb(255 255 255 / 0.16)" />
      {bars.map((bar, i) => {
        const x = x0 + i * slot + (slot - barWidth) / 2;
        const end = lerp(bar.from, bar.to, bar.grow);
        const y1 = level(Math.max(bar.from, end));
        const y0 = level(Math.min(bar.from, end));
        const next = bars[i + 1];
        const highlight = i === DEPRECIATION_STEP ? flash : 0;
        return (
          <g key={bar.label.en}>
            {next && bar.grow >= 1 && next.grow > 0 && i < steps.length - 2 && (
              <line
                x1={x + barWidth}
                x2={x + slot}
                y1={level(bar.to)}
                y2={level(bar.to)}
                stroke="rgb(255 255 255 / 0.25)"
                strokeDasharray="2 2"
              />
            )}
            {highlight > 0 && (
              <rect
                x={x - 3}
                y={y1 - 3}
                width={barWidth + 6}
                height={y0 - y1 + 6}
                rx={4}
                fill="none"
                stroke={colors.gold}
                strokeOpacity={highlight}
              />
            )}
            <rect
              x={x}
              y={y1}
              width={barWidth}
              height={Math.max(0, y0 - y1)}
              rx={2}
              fill={bar.color}
              fillOpacity={bar.value < 0 && i !== DEPRECIATION_STEP ? 0.75 : 0.9}
            />
            <text
              x={x + barWidth / 2}
              y={level(Math.max(bar.from, bar.to)) - 5}
              fontSize={narrow ? 8 : 8.5}
              textAnchor="middle"
              className="fill-muted font-mono"
              opacity={phase(t, 1.2 + i * 0.32, 0.3)}
            >
              {bar.value > 0 && i < steps.length - 1 ? '+' : ''}
              {bar.value < 0 ? `−${-bar.value}` : bar.value}
            </text>
            <text
              x={x + barWidth / 2}
              y={h - 13}
              fontSize={narrow ? 8 : 8.5}
              textAnchor="middle"
              className={i === steps.length - 1 ? 'font-mono' : 'fill-faint font-mono'}
              fill={i === steps.length - 1 ? colors.p1 : undefined}
            >
              {(narrow ? bar.short : bar.label)[locale]}
            </text>
          </g>
        );
      })}
    </g>
  );
}
