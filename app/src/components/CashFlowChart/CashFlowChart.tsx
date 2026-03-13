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

    return (
      <div className={styles.wrapper}>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="fillHigh" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#23C55E" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#23C55E" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="fillBase" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3182F6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3182F6" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="fillLow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E8EB" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11 }}
              tickLine={false}
              label={{ value: '월', position: 'insideRight', offset: 10, fontSize: 11 }}
            />
            <YAxis
              tickFormatter={(v: number) => formatKRWShort(v)}
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={60}
            />
            <Tooltip
              formatter={(v: number | undefined, name: string | undefined) => {
                const label = name === 'high' ? 'High' : name === 'low' ? 'Low' : 'Base';
                return [formatKRWShort(v ?? 0), label];
              }}
              labelFormatter={(l) => `${l}개월째`}
            />
            <ReferenceLine y={0} stroke="#191F28" strokeWidth={1.5} />
            {highPayback!.payback_months !== null && (
              <ReferenceLine
                x={highPayback!.payback_months}
                stroke="#23C55E"
                strokeDasharray="4 4"
                label={{ value: `H:${highPayback!.payback_months}개월`, position: 'top', fontSize: 10, fill: '#23C55E' }}
              />
            )}
            {payback_months !== null && (
              <ReferenceLine
                x={payback_months}
                stroke="#3182F6"
                strokeDasharray="4 4"
                label={{ value: `B:${payback_months}개월`, position: 'top', fontSize: 10, fill: '#3182F6' }}
              />
            )}
            {lowPayback!.payback_months !== null && (
              <ReferenceLine
                x={lowPayback!.payback_months}
                stroke="#F59E0B"
                strokeDasharray="4 4"
                label={{ value: `L:${lowPayback!.payback_months}개월`, position: 'top', fontSize: 10, fill: '#F59E0B' }}
              />
            )}
            <Area
              type="monotone"
              dataKey="high"
              stroke="#23C55E"
              strokeWidth={2}
              strokeDasharray="5 3"
              fill="url(#fillHigh)"
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Area
              type="monotone"
              dataKey="base"
              stroke="#3182F6"
              strokeWidth={2}
              fill="url(#fillBase)"
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Area
              type="monotone"
              dataKey="low"
              stroke="#F59E0B"
              strokeWidth={2}
              strokeDasharray="5 3"
              fill="url(#fillLow)"
              dot={false}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={cumulative_cashflow} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="cashFillPos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3182F6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3182F6" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E8EB" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11 }}
            tickLine={false}
            label={{ value: '월', position: 'insideRight', offset: 10, fontSize: 11 }}
          />
          <YAxis
            tickFormatter={(v: number) => formatKRWShort(v)}
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            width={60}
          />
          <Tooltip
            formatter={(v: number | undefined) => [formatKRWShort(v ?? 0), '누적 현금흐름']}
            labelFormatter={(l) => `${l}개월째`}
          />
          <ReferenceLine y={0} stroke="#191F28" strokeWidth={1.5} />
          {payback_months !== null && (
            <ReferenceLine
              x={payback_months}
              stroke="#23C55E"
              strokeDasharray="4 4"
              label={{ value: `${payback_months}개월`, position: 'top', fontSize: 11, fill: '#23C55E' }}
            />
          )}
          <Area
            type="monotone"
            dataKey="value"
            stroke="#3182F6"
            strokeWidth={2}
            fill="url(#cashFillPos)"
            dot={false}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
