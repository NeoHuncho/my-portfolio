import { type LocalizedString } from '@config/types';
import {
  chf,
  colors,
  easeInOut,
  lerp,
  linear,
  monoWidth,
  phase,
  pulse,
  type SlideProps,
} from './motion';

/**
 * Monthly income by age across the three pillars, then two quick actions
 * (retire earlier, move to another municipality) reshape the projection.
 * All figures are made up.
 */
const FIRST_AGE = 59;
const AGES = Array.from({ length: 20 }, (_, i) => FIRST_AGE + i);
const MAX = 14000;
const NEEDS = 8600;

type Scenario = { retire: number; town: string; p1: number; p2: number; p3: number };

const scenarios: [Scenario, Scenario, Scenario] = [
  { retire: 65, town: 'Nyon', p1: 2450, p2: 3900, p3: 2100 },
  { retire: 63, town: 'Nyon', p1: 2260, p2: 3460, p3: 2000 },
  { retire: 63, town: 'Lausanne', p1: 2260, p2: 3460, p3: 2410 },
];

/** Times the two quick actions are pressed. */
const PRESSES = [2.2, 3.9];
export const PROJECTION_END = 5;

/** [pillar 1, pillar 2, pillar 3, salary], bottom to top. */
function barOf(scenario: Scenario, age: number): number[] {
  if (age < scenario.retire) {
    return [0, 0, 0, 11800 * (1 + (age - FIRST_AGE) * 0.012)];
  }
  const years = age - scenario.retire;
  return [scenario.p1, scenario.p2, scenario.p3 * Math.max(0.5, 1 - years * 0.04), 0];
}

const segmentColors = [colors.p1, colors.p2, colors.p3, colors.salary];

const copy = {
  title: { en: 'Monthly income · CHF', fr: 'Revenu mensuel · CHF' },
  kpi: { en: 'Income at retirement', fr: 'Revenu à la retraite' },
  perMonth: { en: '/ month', fr: '/ mois' },
  retirement: { en: 'Retirement', fr: 'Retraite' },
  town: { en: 'Municipality', fr: 'Commune' },
  needs: { en: 'Needs', fr: 'Besoins' },
} satisfies Record<string, LocalizedString>;

const legend: LocalizedString[] = [
  { en: '1st pillar · AVS', fr: '1er pilier · AVS' },
  { en: '2nd pillar · LPP', fr: '2e pilier · LPP' },
  { en: '3rd pillar · 3a', fr: '3e pilier · 3a' },
  { en: 'Salary', fr: 'Salaire' },
];

const chips: Array<{ full: LocalizedString; short: LocalizedString }> = [
  {
    full: { en: 'Retire at 63', fr: 'Retraite à 63' },
    short: { en: 'Retire 63', fr: 'Retraite 63' },
  },
  {
    full: { en: 'Move to Lausanne', fr: 'Vivre à Lausanne' },
    short: { en: 'Lausanne', fr: 'Lausanne' },
  },
];

function Chip({
  x,
  y,
  label,
  size,
  t,
  press,
}: {
  x: number;
  y: number;
  label: string;
  size: number;
  t: number;
  press: number;
}) {
  const width = monoWidth(label, size) + 27;
  const height = 20;
  const active = t >= press;
  const squeeze = 1 - 0.08 * pulse(t, press - 0.05, 0.3);
  const ripple = linear((t - press) / 0.7);
  const cx = x + width / 2;
  const cy = y + height / 2;
  return (
    <g>
      {ripple > 0 && ripple < 1 && (
        <rect
          x={cx - width / 2 - ripple * 10}
          y={cy - height / 2 - ripple * 10}
          width={width + ripple * 20}
          height={height + ripple * 20}
          rx={10 + ripple * 10}
          fill="none"
          stroke={colors.p1}
          strokeOpacity={0.6 * (1 - ripple)}
        />
      )}
      <g transform={`translate(${cx} ${cy}) scale(${squeeze}) translate(${-cx} ${-cy})`}>
        <rect
          x={x + 0.5}
          y={y + 0.5}
          width={width - 1}
          height={height - 1}
          rx={height / 2}
          fill={active ? 'rgb(255 107 53 / 0.16)' : '#131316'}
          stroke={active ? colors.p1 : 'rgb(255 255 255 / 0.16)'}
          style={{ transition: 'fill 0.3s, stroke 0.3s' }}
        />
        {active ? (
          <path
            d={`M${x + 8} ${cy} l2.5 2.5 l4.5 -5`}
            fill="none"
            stroke={colors.p1}
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d={`M${x + 11} ${cy - 3.5} v7 M${x + 7.5} ${cy} h7`}
            stroke="#9b9ba3"
            strokeWidth={1.4}
            strokeLinecap="round"
          />
        )}
        <text
          x={x + 20}
          y={cy + size * 0.36}
          fontSize={size}
          className={active ? 'font-mono' : 'fill-muted font-mono'}
          fill={active ? colors.p1 : undefined}
        >
          {label}
        </text>
      </g>
    </g>
  );
}

export default function ProjectionSlide({ t, w, h, locale }: SlideProps) {
  const narrow = w < 420;
  const m1 = phase(t, PRESSES[0] + 0.15, 0.8, easeInOut);
  const m2 = phase(t, PRESSES[1] + 0.15, 0.8, easeInOut);
  const mix = (pick: (scenario: Scenario) => number) =>
    lerp(lerp(pick(scenarios[0]), pick(scenarios[1]), m1), pick(scenarios[2]), m2);

  const left = narrow ? 10 : 182;
  const right = w - 12;
  const top = narrow ? 40 : 44;
  const bottom = h - 18;
  const step = (right - left) / AGES.length;
  const barWidth = Math.max(4, step * 0.64);
  const y = (value: number) => bottom - (value / MAX) * (bottom - top);

  const retireAge = mix((scenario) => scenario.retire);
  const markerX = left + (retireAge - FIRST_AGE) * step;
  const income = mix((scenario) => scenario.p1 + scenario.p2 + scenario.p3) * phase(t, 0.3, 1.3);
  const baseIncome = scenarios[0].p1 + scenarios[0].p2 + scenarios[0].p3;
  const delta = income - baseIncome;
  const markerIn = phase(t, 1.1, 0.5);
  const needsIn = phase(t, 1.2, 0.8);

  const chipSize = narrow ? 9 : 9.5;
  const chipLabels = chips.map((chip) => (narrow ? chip.short : chip.full)[locale]);
  const chipWidths = chipLabels.map((label) => monoWidth(label, chipSize) + 27);
  const chipY = narrow ? 8 : 12;
  const chip2X = right - chipWidths[1];
  const chip1X = chip2X - 6 - chipWidths[0];
  const title = copy.title[locale].toUpperCase();
  const showTitle = !narrow && chip1X - left > monoWidth(title, 8.5) + 12;

  return (
    <g>
      {/* Grid and axes. */}
      {[4000, 8000, 12000].map((value) => (
        <g key={value}>
          <line
            x1={left}
            x2={right}
            y1={y(value)}
            y2={y(value)}
            stroke="rgb(255 255 255 / 0.07)"
            strokeDasharray="2 4"
          />
          {!narrow && (
            <text
              x={left - 6}
              y={y(value) + 3}
              fontSize={8}
              textAnchor="end"
              className="fill-faint font-mono"
            >
              {value / 1000}k
            </text>
          )}
        </g>
      ))}
      <line x1={left} x2={right} y1={bottom} y2={bottom} stroke="rgb(255 255 255 / 0.16)" />
      {[60, 65, 70, 75].map((age) => (
        <text
          key={age}
          x={left + (age - FIRST_AGE + 0.5) * step}
          y={h - 5}
          fontSize={8.5}
          textAnchor="middle"
          className="fill-faint font-mono"
        >
          {age}
        </text>
      ))}

      {/* Stacked bars, growing in one after the other. */}
      {AGES.map((age, i) => {
        const grow = phase(t, 0.15 + i * 0.04, 0.6);
        const parts = scenarios.map((scenario) => barOf(scenario, age));
        const values = parts[0].map(
          (_, k) => lerp(lerp(parts[0][k], parts[1][k], m1), parts[2][k], m2) * grow
        );
        let stacked = 0;
        const x = left + i * step + (step - barWidth) / 2;
        return (
          <g key={age}>
            {values.map((value, k) => {
              if (value < 30) {
                return null;
              }
              const y1 = y(stacked + value);
              const y0 = y(stacked);
              stacked += value;
              return (
                <rect
                  // Segments are fixed and ordered: pillar 1, 2, 3, salary.
                  // eslint-disable-next-line react/no-array-index-key
                  key={k}
                  x={x}
                  y={y1}
                  width={barWidth}
                  height={Math.max(0, y0 - y1 - 1)}
                  rx={1.5}
                  fill={segmentColors[k]}
                  fillOpacity={k === 3 ? 1 : 0.9 - k * 0.08}
                />
              );
            })}
          </g>
        );
      })}

      {/* Needs line. */}
      <line
        x1={left}
        x2={lerp(left, right, needsIn)}
        y1={y(NEEDS)}
        y2={y(NEEDS)}
        stroke="#ededeb"
        strokeOpacity={0.55}
        strokeDasharray="4 3"
      />
      <text
        x={right}
        y={y(NEEDS) - 5}
        fontSize={8.5}
        textAnchor="end"
        className="fill-muted font-mono"
        opacity={needsIn}
      >
        {copy.needs[locale]}
      </text>

      {/* Retirement marker. */}
      <g opacity={markerIn}>
        <line
          x1={markerX}
          x2={markerX}
          y1={top - 2}
          y2={bottom}
          stroke="#ededeb"
          strokeWidth={1.2}
          strokeDasharray="3 3"
        />
        <rect x={markerX - 13} y={top - 10} width={26} height={15} rx={7.5} fill="#ededeb" />
        <text
          x={markerX}
          y={top + 0.5}
          fontSize={9}
          fontWeight={600}
          textAnchor="middle"
          className="font-mono"
          fill="#131316"
        >
          {Math.round(retireAge)}
        </text>
      </g>

      {/* Quick actions. */}
      {showTitle && (
        <text
          x={left}
          y={chipY + 13.5}
          fontSize={8.5}
          letterSpacing="0.08em"
          className="fill-faint font-mono"
        >
          {title}
        </text>
      )}
      <Chip x={chip1X} y={chipY} label={chipLabels[0]} size={chipSize} t={t} press={PRESSES[0]} />
      <Chip x={chip2X} y={chipY} label={chipLabels[1]} size={chipSize} t={t} press={PRESSES[1]} />

      {narrow ? (
        <text x={10} y={chipY + 14}>
          <tspan fontSize={8.5} className="fill-muted font-mono">
            CHF{' '}
          </tspan>
          <tspan fontSize={13} fontWeight={600} className="fill-ink">
            {chf(income)}
          </tspan>
          <tspan fontSize={8.5} className="fill-faint font-mono">
            {' '}
            {copy.perMonth[locale]}
          </tspan>
        </text>
      ) : (
        <g>
          <text
            x={14}
            y={22}
            fontSize={8.5}
            letterSpacing="0.08em"
            className="fill-faint font-mono"
          >
            {copy.kpi[locale].toUpperCase()}
          </text>
          <text x={14} y={52}>
            <tspan fontSize={10} className="fill-muted font-mono">
              CHF{' '}
            </tspan>
            <tspan fontSize={22} fontWeight={600} letterSpacing="-0.02em" className="fill-ink">
              {chf(income)}
            </tspan>
          </text>
          <text x={14} y={68} fontSize={9.5} className="font-mono">
            <tspan className="fill-faint">{copy.perMonth[locale]}</tspan>
            {t > PRESSES[0] && Math.abs(delta) > 5 && (
              <tspan dx={8} fill={delta < 0 ? colors.red : colors.ok}>
                {delta < 0 ? '−' : '+'}
                {chf(Math.abs(delta))}
              </tspan>
            )}
          </text>
          {[
            {
              label: copy.retirement[locale],
              value: String(Math.round(retireAge)),
              changed: t > PRESSES[0],
            },
            {
              label: copy.town[locale],
              value: m2 > 0.5 ? scenarios[2].town : scenarios[0].town,
              changed: t > PRESSES[1],
            },
          ].map((row, i) => (
            <g key={row.label}>
              <text x={14} y={90 + i * 15} fontSize={9} className="fill-faint font-mono">
                {row.label}
              </text>
              <text
                x={160}
                y={90 + i * 15}
                fontSize={9}
                textAnchor="end"
                className={row.changed ? 'font-mono' : 'fill-ink font-mono'}
                fill={row.changed ? colors.p1 : undefined}
              >
                {row.value}
              </text>
            </g>
          ))}
          {legend.map((pillar, i) => (
            <g key={pillar.en}>
              <rect
                x={14}
                y={h - 66 + i * 14}
                width={8}
                height={8}
                rx={2}
                fill={segmentColors[i]}
                fillOpacity={i === 3 ? 1 : 0.9 - i * 0.08}
              />
              <text x={28} y={h - 58.5 + i * 14} fontSize={9.5} className="fill-muted">
                {pillar[locale]}
              </text>
            </g>
          ))}
          <line x1={168} x2={168} y1={12} y2={h - 12} stroke="rgb(255 255 255 / 0.08)" />
        </g>
      )}
    </g>
  );
}
