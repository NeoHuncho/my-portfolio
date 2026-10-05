import { type LocalizedString } from '@config/types';
import { chf, colors, easeInOut, phase, type SlideProps } from './motion';

/**
 * A wealth dashboard: KPI tiles, an allocation donut and a data grid whose
 * selected row lights up its slice. All figures are made up.
 */
type Row = { label: LocalizedString; value: number; color: string };

const rows: Row[] = [
  { label: { en: 'Equities', fr: 'Actions' }, value: 940_000, color: colors.p2 },
  { label: { en: 'Real estate', fr: 'Immobilier' }, value: 720_000, color: colors.p1 },
  { label: { en: '2nd pillar', fr: '2e pilier' }, value: 410_000, color: colors.p3 },
  { label: { en: 'Bonds', fr: 'Obligations' }, value: 250_000, color: colors.violet },
  { label: { en: '3rd pillar 3a', fr: '3e pilier 3a' }, value: 160_000, color: colors.gold },
];
const TOTAL = rows.reduce((sum, row) => sum + row.value, 0);
/** Where each slice starts around the donut, as a share of the total. */
const starts = rows.map(
  (_, i) => rows.slice(0, i).reduce((sum, row) => sum + row.value, 0) / TOTAL
);

/** The grid selection walks down the rows. */
const SELECTIONS = [2.3, 3.3, 4.3];
export const DASHBOARD_END = 4.6;

const copy = {
  worth: { en: 'Net worth', fr: 'Fortune nette' },
  liquidity: { en: 'Liquidity', fr: 'Liquidités' },
  pensions: { en: 'Pensions 2 + 3a', fr: 'Prévoyance 2 + 3a' },
  asset: { en: 'Asset class', fr: 'Classe' },
  value: { en: 'Value', fr: 'Valeur' },
  share: { en: 'Share', fr: 'Part' },
} satisfies Record<string, LocalizedString>;

const sparkline = [4, 6, 5, 8, 7, 10, 9, 12, 14];

function Tile({
  x,
  y,
  width,
  height,
  label,
  value,
  delta,
  spark,
  t,
  delay,
  small,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  value: string;
  delta?: string;
  spark?: boolean;
  t: number;
  delay: number;
  small: boolean;
}) {
  const enter = phase(t, delay, 0.5);
  const sparkWidth = 44;
  const draw = phase(t, delay + 0.4, 0.9, easeInOut);
  const points = sparkline
    .map((v, i) => {
      const px = x + width - 10 - sparkWidth + (i / (sparkline.length - 1)) * sparkWidth;
      const py = y + height - 10 - (v / 14) * 16;
      return `${px},${py}`;
    })
    .join(' ');
  return (
    <g opacity={enter} transform={`translate(0 ${(1 - enter) * 6})`}>
      <rect
        x={x + 0.5}
        y={y + 0.5}
        width={width - 1}
        height={height - 1}
        rx={8}
        fill="#131316"
        stroke="rgb(255 255 255 / 0.08)"
      />
      <text
        x={x + 10}
        y={y + (small ? 13 : 16)}
        fontSize={small ? 7.5 : 8}
        letterSpacing="0.08em"
        className="fill-faint font-mono"
      >
        {label.toUpperCase()}
      </text>
      <text
        x={x + 10}
        y={y + height - (small ? 8 : 11)}
        fontSize={small ? 12 : 15}
        fontWeight={600}
        letterSpacing="-0.01em"
        className="fill-ink"
      >
        {value}
      </text>
      {delta && !small && (
        <text
          x={x + width - 10}
          y={y + height - 11}
          fontSize={9}
          textAnchor="end"
          className="font-mono"
          fill={colors.ok}
        >
          {delta}
        </text>
      )}
      {spark && !small && (
        <polyline
          points={points}
          fill="none"
          stroke={colors.p2}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - draw}
        />
      )}
    </g>
  );
}

export default function DashboardSlide({ t, w, h, locale }: SlideProps) {
  const narrow = w < 420;
  const count = phase(t, 0.2, 1.3);
  const selected = SELECTIONS.reduce((last, at, i) => (t >= at ? i : last), -1);

  /* KPI tiles. */
  const tileHeight = narrow ? 34 : 46;
  const tileGap = 8;
  const tiles = [
    {
      label: copy.worth[locale],
      value: `CHF ${((TOTAL / 1e6) * count).toFixed(2)}M`,
      delta: '+4.2%',
    },
    { label: copy.liquidity[locale], value: `CHF ${chf(312 * count)}k`, spark: true },
    { label: copy.pensions[locale], value: `CHF ${chf(570 * count)}k`, delta: '+2.1%' },
  ].slice(0, narrow ? 2 : 3);
  const tileWidth = (w - 24 - tileGap * (tiles.length - 1)) / tiles.length;

  /* Donut. */
  const lower = 10 + tileHeight + (narrow ? 8 : 10);
  const radius = narrow ? 30 : 42;
  const stroke = narrow ? 9 : 12;
  const cx = 12 + radius + stroke / 2 + (narrow ? 2 : 6);
  const cy = (lower + h - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const sweep = phase(t, 0.5, 1.2, easeInOut) * circumference;

  const selectedLabel = selected < 0 ? 'CHF' : rows[selected].label[locale];
  const centerLabel = narrow ? selectedLabel.split(' ')[0] : selectedLabel;

  /* Grid. */
  const gx = cx + radius + stroke / 2 + (narrow ? 14 : 22);
  const gx1 = w - 12;
  const headerHeight = narrow ? 14 : 17;
  const visibleRows = narrow ? rows.slice(0, 4) : rows;
  const rowHeight = Math.min(18, (h - 8 - lower - headerHeight) / visibleRows.length);
  const shareX = gx1 - (narrow ? 58 : 76);
  const valueX = shareX - 10;

  return (
    <g>
      {tiles.map((tile, i) => (
        <Tile
          key={tile.label}
          x={12 + i * (tileWidth + tileGap)}
          y={10}
          width={tileWidth}
          height={tileHeight}
          t={t}
          delay={0.05 + i * 0.12}
          small={narrow}
          {...tile}
        />
      ))}

      {/* Allocation donut. */}
      <g transform={`rotate(-90 ${cx} ${cy})`}>
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#23232a" strokeWidth={stroke} />
        {rows.map((row, i) => {
          const length = (row.value / TOTAL) * circumference;
          const start = starts[i] * circumference;
          const visible = Math.max(0, Math.min(length, sweep - start) - 1.5);
          const active = selected === i;
          return (
            <circle
              key={row.label.en}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={row.color}
              strokeWidth={active ? stroke + 5 : stroke}
              strokeDasharray={`${visible} ${circumference}`}
              strokeDashoffset={-start}
              style={{
                opacity: selected < 0 || active ? 0.95 : 0.4,
                transition: 'opacity 0.35s, stroke-width 0.35s',
              }}
            />
          );
        })}
      </g>
      <text
        x={cx}
        y={cy + 1}
        fontSize={narrow ? 11 : 13}
        fontWeight={600}
        textAnchor="middle"
        className="fill-ink"
      >
        {selected < 0
          ? `${((TOTAL / 1e6) * count).toFixed(2)}M`
          : `${Math.round((rows[selected].value / TOTAL) * 100)}%`}
      </text>
      <text
        x={cx}
        y={cy + (narrow ? 11 : 13)}
        fontSize={narrow ? 7 : 8}
        textAnchor="middle"
        className="fill-faint font-mono"
      >
        {centerLabel}
      </text>

      {/* Data grid. */}
      <g opacity={phase(t, 0.6, 0.4)}>
        <rect x={gx} y={lower} width={gx1 - gx} height={headerHeight} rx={4} fill="#131316" />
        <text
          x={gx + 8}
          y={lower + headerHeight / 2 + 3}
          fontSize={7.5}
          letterSpacing="0.08em"
          className="fill-faint font-mono"
        >
          {copy.asset[locale].toUpperCase()}
        </text>
        {!narrow && (
          <text
            x={valueX}
            y={lower + headerHeight / 2 + 3}
            fontSize={7.5}
            letterSpacing="0.08em"
            textAnchor="end"
            className="fill-faint font-mono"
          >
            {copy.value[locale].toUpperCase()} ↓
          </text>
        )}
        <text
          x={shareX + 6}
          y={lower + headerHeight / 2 + 3}
          fontSize={7.5}
          letterSpacing="0.08em"
          className="fill-faint font-mono"
        >
          {copy.share[locale].toUpperCase()}
        </text>
      </g>
      {visibleRows.map((row, i) => {
        const enter = phase(t, 0.75 + i * 0.1, 0.45);
        const ry = lower + headerHeight + i * rowHeight;
        const share = row.value / TOTAL;
        const active = selected === i;
        const barMax = narrow ? 22 : 34;
        return (
          <g key={row.label.en} opacity={enter} transform={`translate(${(1 - enter) * 10} 0)`}>
            <rect
              x={gx}
              y={ry}
              width={gx1 - gx}
              height={rowHeight}
              fill={colors.p1}
              style={{ opacity: active ? 0.12 : 0, transition: 'opacity 0.35s' }}
            />
            <rect
              x={gx}
              y={ry}
              width={2}
              height={rowHeight}
              fill={colors.p1}
              style={{ opacity: active ? 1 : 0, transition: 'opacity 0.35s' }}
            />
            <line
              x1={gx}
              x2={gx1}
              y1={ry + rowHeight}
              y2={ry + rowHeight}
              stroke="rgb(255 255 255 / 0.06)"
            />
            <circle cx={gx + 11} cy={ry + rowHeight / 2} r={3} fill={row.color} />
            <text
              x={gx + 20}
              y={ry + rowHeight / 2 + 3.2}
              fontSize={narrow ? 8.5 : 9.5}
              className={active ? 'fill-ink' : 'fill-muted'}
            >
              {row.label[locale]}
            </text>
            {!narrow && (
              <text
                x={valueX}
                y={ry + rowHeight / 2 + 3.2}
                fontSize={9}
                textAnchor="end"
                className="fill-ink font-mono"
              >
                {chf(row.value)}
              </text>
            )}
            <rect
              x={shareX + 6}
              y={ry + rowHeight / 2 - 2}
              width={barMax}
              height={4}
              rx={2}
              fill="#23232a"
            />
            <rect
              x={shareX + 6}
              y={ry + rowHeight / 2 - 2}
              width={barMax * (share / 0.4) * phase(t, 1 + i * 0.1, 0.7)}
              height={4}
              rx={2}
              fill={row.color}
              fillOpacity={0.9}
            />
            <text
              x={gx1 - 6}
              y={ry + rowHeight / 2 + 3}
              fontSize={8.5}
              textAnchor="end"
              className="fill-muted font-mono"
            >
              {Math.round(share * 100)}%
            </text>
          </g>
        );
      })}
    </g>
  );
}
