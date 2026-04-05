import styles from './AiAnalysis.module.css';
import type { SimulationResult } from '../../types';
import { formatKRWShort } from '../../lib/format';

interface Props {
  result: SimulationResult;
}

export function AiAnalysis({ result }: Props) {
  const { inputs, pnl, daily } = result;
  const bt = inputs.business_type;

  const dailyCustomers = inputs.daily_customers_override ?? bt.avg_daily_customers_medium;
  const ticketPrice = inputs.ticket_price_override ?? bt.avg_ticket_price;
  const operatingDays = inputs.operating_days ?? 25;
  const materialRatio = inputs.material_cost_ratio_override ?? bt.material_cost_ratio;
  const loanAmount = inputs.capital.initial_investment - inputs.capital.equity;
  const hasLoan = loanAmount > 0;
  const hasEmployees = pnl.sga_detail.labor_headcount > 0;

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.headerIcon}>🤖</span>
        <span className={styles.headerTitle}>AI의 사업분석</span>
      </div>

      {/* Step 1: 매출 */}
      <div className={styles.step}>
        <div className={styles.stepHeader}>
          <div className={styles.stepIcon} style={{ background: '#EBF4FF' }}>🛒</div>
          <span className={styles.stepTitle}>하루 매출부터 볼까요?</span>
        </div>
        <div className={styles.stepBody}>
          <p>하루 평균 <b>{dailyCustomers}명</b>이 방문하고,
          한 번에 평균 <b>{formatKRWShort(ticketPrice)}</b>씩 써요.</p>
          <div className={styles.calc}>
            <span>{dailyCustomers}명 × {formatKRWShort(ticketPrice)} = <b>{formatKRWShort(daily.daily_revenue)}</b>/일</span>
          </div>
          <div className={styles.calc}>
            <span className={styles.calcArrow}>→</span>
            <span>한 달 {operatingDays}일 영업하면</span>
          </div>
          <div className={styles.calc}>
            <span className={styles.calcResult}>월매출 {formatKRWShort(pnl.revenue)}</span>
          </div>
        </div>
      </div>

      {/* Step 2: 원가 */}
      <div className={styles.step}>
        <div className={styles.stepHeader}>
          <div className={styles.stepIcon} style={{ background: '#FFF4E6' }}>🧾</div>
          <span className={styles.stepTitle}>재료비(원가)를 빼볼게요</span>
        </div>
        <div className={styles.stepBody}>
          <p>{bt.name}의 원가율은 <b>{Math.round(materialRatio * 110)}%</b>예요.</p>
          <div className={styles.calc}>
            <span>{formatKRWShort(pnl.revenue)} × {Math.round(materialRatio * 110)}%
            = <b>{formatKRWShort(pnl.cogs)}</b></span>
          </div>
          <div className={styles.calc}>
            <span className={styles.calcArrow}>→</span>
            <span className={styles.calcResult}>매출총이익 {formatKRWShort(pnl.gross_profit)}</span>
          </div>
          <p style={{ fontSize: 12, color: '#8B95A1', marginTop: 6 }}>
            재료비를 빼고 남는 돈이에요. 여기서 고정비를 더 빼야 해요.
          </p>
        </div>
      </div>

      {/* Step 3: 고정비 */}
      <div className={styles.step}>
        <div className={styles.stepHeader}>
          <div className={styles.stepIcon} style={{ background: '#F0FFF4' }}>🏠</div>
          <span className={styles.stepTitle}>매달 나가는 고정비가 있어요</span>
        </div>
        <div className={styles.stepBody}>
          <ul className={styles.itemList}>
            <li><span>임대료</span><span className={styles.expense}>-{formatKRWShort(pnl.sga_detail.rent)}</span></li>
            {hasEmployees && (
              <li><span>인건비 ({pnl.sga_detail.labor_headcount}명)</span><span className={styles.expense}>-{formatKRWShort(pnl.sga_detail.labor)}</span></li>
            )}
            {pnl.sga_detail.delivery_commission > 0 && (
              <li><span>배달 수수료</span><span className={styles.expense}>-{formatKRWShort(pnl.sga_detail.delivery_commission)}</span></li>
            )}
            <li><span>기타 운영비</span><span className={styles.expense}>-{formatKRWShort(pnl.sga_detail.misc_operating)}</span></li>
          </ul>
          <div className={styles.subtotal}>
            <span>고정비 합계</span>
            <span className={styles.expense}>-{formatKRWShort(pnl.sg_and_a)}</span>
          </div>
        </div>
      </div>

      {/* Step 4: 영업이익 */}
      <div className={styles.step}>
        <div className={styles.stepHeader}>
          <div className={styles.stepIcon} style={{ background: '#F5F0FF' }}>💼</div>
          <span className={styles.stepTitle}>영업이익이 나왔어요</span>
        </div>
        <div className={styles.stepBody}>
          <div className={styles.calc}>
            <span>매출총이익 {formatKRWShort(pnl.gross_profit)} - 고정비 {formatKRWShort(pnl.sg_and_a)}</span>
          </div>
          <div className={styles.calc}>
            <span className={styles.calcArrow}>→</span>
            <span className={styles.calcResult} style={{ color: pnl.operating_profit >= 0 ? '#16A34A' : '#EF4444' }}>
              영업이익 {pnl.operating_profit >= 0 ? '+' : ''}{formatKRWShort(pnl.operating_profit)}
            </span>
          </div>
          <p style={{ fontSize: 12, color: '#8B95A1', marginTop: 6 }}>
            {pnl.operating_profit >= 0
              ? '장사 자체로는 돈이 남아요. 하지만 세금과 대출이 남았어요.'
              : '장사 자체로 적자예요. 비용 구조를 조정해볼 필요가 있어요.'}
          </p>
        </div>
      </div>

      {/* Step 5: 세금 + 이자 */}
      <div className={styles.step}>
        <div className={styles.stepHeader}>
          <div className={styles.stepIcon} style={{ background: '#FFF0F0' }}>📋</div>
          <span className={styles.stepTitle}>세금과 {hasLoan ? '대출 ' : ''}비용을 빼면</span>
        </div>
        <div className={styles.stepBody}>
          <ul className={styles.itemList}>
            <li><span>종합소득세 + 지방세</span><span className={styles.expense}>-{formatKRWShort(pnl.tax)}</span></li>
            <li><span>부가세</span><span className={styles.expense}>-{formatKRWShort(pnl.vat)}</span></li>
            {hasLoan && (
              <>
                <li>
                  <span>대출 이자 ({formatKRWShort(loanAmount)}, 연 {(inputs.capital.interest_rate * 100).toFixed(1)}%)</span>
                  <span className={styles.expense}>-{formatKRWShort(pnl.interest_expense)}</span>
                </li>
                <li><span>원금 상환</span><span className={styles.expense}>-{formatKRWShort(pnl.principal_repayment)}</span></li>
              </>
            )}
          </ul>
        </div>
      </div>

      {/* 최종 결론 */}
      <div className={styles.conclusion}>
        <div className={styles.conclusionLabel}>사장님 손에 남는 돈 (월)</div>
        <div className={`${styles.conclusionValue} ${pnl.free_cash_flow >= 0 ? styles.conclusionPositive : styles.conclusionNegative}`}>
          {pnl.free_cash_flow >= 0 ? '+' : ''}{formatKRWShort(pnl.free_cash_flow)}
        </div>
        <div className={styles.conclusionNote}>
          세금, 대출 상환까지 전부 빼고 실제로 남는 현금이에요
        </div>
      </div>
    </div>
  );
}
