import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer
} from 'recharts';
import styles from './CashFlowChart.module.css';
import type { PaybackResult } from '../../types';
import { formatKRWShort } from '../../lib/format';

interface Props {
  payback: PaybackResult;
  highPayback?: PaybackResult;
  lowPayback?: PaybackResult;
}

// X축 간격 조정: 6개월 단위로만 표시
function xAxisTicks(dataLength: number): number[] {
  const ticks: number[] = [];
  for (let i = 6; i <= dataLength; i += 6) ticks.push(i);
  if (ticks[0] !== 1) ticks.unshift(1);
  return ticks;
}

export function CashFlowChart({ payback, highPayback, lowPayback }: Props) {
  const { cumulative_cashflow, payback_months } = payback;
  const isMulti = highPayback != null && lowPayback != null;

  if (isMulti) {
    const data = cumulative_cashflow.map((pt, i) => ({
      month: pt.month,
      base: pt.value,
      high: highPayback!.cumulative_cashflow[i]?.value ?? pt.value,
      low: lowPayback!.cumulative_cashflow[i]?.value ?? pt.value,
    }));

    // 범례 데이터
    const legends = [
      highPayback!.payback_months !== null
        ? { label: '낙관', months: highPayback!.payback_months, color: '#23C55E' }
        : null,
      payback_months !== null
        ? { label: '기본', months: payback_months, color: '#3182F6' }
        : null,
      lowPayback!.payback_months !== null
        ? { label: '보수', months: lowPayback!.payback_months, color: '#F59E0B' }
        : null,
    ].filter(Boolean) as { label: string; months: number; color: string }[];

    const ticks = xAxisTicks(data.length);

    return (
      <div className={styles.wrapper}>
        <div className={styles.legend}>
          {legends.map(l => (
            <span key={l.label} className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: l.color }} />
              {l.label} {l.months}개월
            </span>
          ))}
          {legends.length === 0 && (
            <span className={styles.legendItem} style={{ color: '#999' }}>
              60개월 내 회수 불가
            </span>
          )}
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="fillHigh" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#23C55E" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#23C55E" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="fillBase" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3182F6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#3182F6" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="fillLow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F3" />
            <XAxis
              dataKey="month"
              ticks={ticks}
              tick={{ fontSize: 10, fill: '#999' }}
              tickLine={false}
              axisLine={{ stroke: '#E5E8EB' }}
              tickFormatter={(v: number) => v >= 12 && v % 12 === 0 ? `${v / 12}년` : `${v}`}
            />
            <YAxis
              tickFormatter={(v: number) => formatKRWShort(v)}
              tick={{ fontSize: 10, fill: '#999' }}
              tickLine={false}
              axisLine={false}
              width={55}
            />
            <Tooltip
              contentStyle={{ fontSize: 12, padding: '6px 10px', borderRadius: 8, border: '1px solid #E5E8EB' }}
              formatter={(v: number | undefined, name: string | undefined) => {
                const label = name === 'high' ? '낙관' : name === 'low' ? '보수' : '기본';
                return [formatKRWShort(v ?? 0), label];
              }}
              labelFormatter={(l) => `${l}개월째`}
            />
            <ReferenceLine y={0} stroke="#C8CCD0" strokeWidth={1} />
            {highPayback!.payback_months !== null && (
              <ReferenceLine x={highPayback!.payback_months} stroke="#23C55E" strokeDasharray="4 4" strokeOpacity={0.6} />
            )}
            {payback_months !== null && (
              <ReferenceLine x={payback_months} stroke="#3182F6" strokeDasharray="4 4" strokeOpacity={0.6} />
            )}
            {lowPayback!.payback_months !== null && (
              <ReferenceLine x={lowPayback!.payback_months} stroke="#F59E0B" strokeDasharray="4 4" strokeOpacity={0.6} />
            )}
            <Area
              type="monotone"
              dataKey="high"
              stroke="#23C55E"
              strokeWidth={1.5}
              strokeDasharray="5 3"
              fill="url(#fillHigh)"
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="base"
              stroke="#3182F6"
              strokeWidth={2}
              fill="url(#fillBase)"
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="low"
              stroke="#F59E0B"
              strokeWidth={1.5}
              strokeDasharray="5 3"
              fill="url(#fillLow)"
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  const ticks = xAxisTicks(cumulative_cashflow.length);

  return (
    <div className={styles.wrapper}>
      {payback_months !== null && (
        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: '#3182F6' }} />
            투자회수 {payback_months}개월
          </span>
        </div>
      )}
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={cumulative_cashflow} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="cashFillPos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3182F6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#3182F6" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F3" />
          <XAxis
            dataKey="month"
            ticks={ticks}
            tick={{ fontSize: 10, fill: '#999' }}
            tickLine={false}
            axisLine={{ stroke: '#E5E8EB' }}
            tickFormatter={(v: number) => v >= 12 && v % 12 === 0 ? `${v / 12}년` : `${v}`}
          />
          <YAxis
            tickFormatter={(v: number) => formatKRWShort(v)}
            tick={{ fontSize: 10, fill: '#999' }}
            tickLine={false}
            axisLine={false}
            width={55}
          />
          <Tooltip
            contentStyle={{ fontSize: 12, padding: '6px 10px', borderRadius: 8, border: '1px solid #E5E8EB' }}
            formatter={(v: number | undefined) => [formatKRWShort(v ?? 0), '누적 현금흐름']}
            labelFormatter={(l) => `${l}개월째`}
          />
          <ReferenceLine y={0} stroke="#C8CCD0" strokeWidth={1} />
          {payback_months !== null && (
            <ReferenceLine x={payback_months} stroke="#3182F6" strokeDasharray="4 4" strokeOpacity={0.6} />
          )}
          <Area
            type="monotone"
            dataKey="value"
            stroke="#3182F6"
            strokeWidth={2}
            fill="url(#cashFillPos)"
            dot={false}
            activeDot={{ r: 3, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
