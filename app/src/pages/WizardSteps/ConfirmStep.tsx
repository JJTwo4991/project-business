import styles from './WizardSteps.module.css';
import type { SimulatorInputs, StepId } from '../../types';
import { formatKRWShort, formatPercent } from '../../lib/format';
import { resolveBusinessParams } from '../../lib/calculator';

interface Props {
  inputs: SimulatorInputs;
  onCalculate: () => void;
  onGoTo: (step: StepId) => void;
}

export function ConfirmStep({ inputs, onCalculate, onGoTo }: Props) {
  const { business_type: bt, scale, capital } = inputs;
  const params = resolveBusinessParams(inputs);
  const debt = Math.max(0, capital.initial_investment - capital.equity);

  const rows: { label: string; value: string; step?: StepId }[] = [
    { label: '업종', value: bt.name, step: 'select-industry' },
    { label: '규모', value: scale === 'small' ? '소형' : scale === 'large' ? '대형' : '중형', step: 'select-scale' },
    { label: '초기투자금', value: formatKRWShort(capital.initial_investment), step: 'investment-breakdown' },
    { label: '자기자본', value: formatKRWShort(capital.equity), step: 'set-investment' },
    { label: '대출', value: formatKRWShort(debt), step: 'set-loan' },
    { label: '금리', value: formatPercent(capital.interest_rate), step: 'set-loan' },
    { label: '대출기간', value: `${capital.loan_term_years}년`, step: 'set-loan' },
    {
      label: '일 방문객',
      value: `${inputs.daily_customers_override ?? (scale === 'small' ? bt.avg_daily_customers_small : scale === 'large' ? bt.avg_daily_customers_large : bt.avg_daily_customers_medium)}명`,
      step: 'set-customers',
    },
    { label: '객단가', value: formatKRWShort(params.avg_ticket_price), step: 'set-ticket' },
    { label: '직원 수', value: `${Math.round(inputs.labor_headcount ?? 1)}명`, step: 'set-labor' },
    { label: '월 임대료', value: formatKRWShort(inputs.rent_monthly ?? 0), step: 'set-rent' },
  ];

  return (
    <div className={styles.step}>
      <h2 className={styles.stepTitle}>입력 내용 확인</h2>
      <p className={styles.stepDesc}>숫자를 눌러 수정할 수 있어요</p>
      <div className={styles.summarySection}>
        {rows.map((row, i) => (
          <div
            key={i}
            className={`${styles.summaryRow} ${row.step ? styles.summaryRowClickable : ''}`}
            onClick={row.step ? () => onGoTo(row.step!) : undefined}
          >
            <span className={styles.summaryLabel}>{row.label}</span>
            <span className={`${styles.summaryValue} ${row.step ? styles.summaryValueLink : ''}`}>
              {row.value}
            </span>
          </div>
        ))}
      </div>
      <div className={styles.disclaimer}>
        이 시뮬레이션은 참고용이에요. 부가가치세(VAT)는 반영하지 않았어요.
        실제 수익은 입지, 경쟁, 운영 역량 등에 따라 크게 달라질 수 있어요.
      </div>
      <button className={styles.nextBtn} onClick={onCalculate}>결과 확인하기</button>
    </div>
  );
}
