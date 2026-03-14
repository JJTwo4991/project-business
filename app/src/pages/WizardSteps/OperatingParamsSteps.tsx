import { useState } from 'react';
import styles from './WizardSteps.module.css';
import { SliderInput } from '../../components/SliderInput/SliderInput';
import type { SimulatorInputs } from '../../types';
import { formatKRW, formatKRWShort } from '../../lib/format';
import { resolveBusinessParams } from '../../lib/calculator';
import { getScaleSqm } from '../../lib/scale';
import { GuidelineBox } from '../../components/GuidelineBox/GuidelineBox';
import { getGuideline, getRevenueGuideline } from '../../data/guidelines';
import { useBenchmarkData } from '../../hooks/useBenchmarkData';
import { getMenuItems } from '../../data/menuItems';

interface StepProps {
  inputs: SimulatorInputs;
  onOverride: (key: keyof Omit<SimulatorInputs, 'business_type' | 'scale' | 'capital' | 'region' | 'selected_brand'>, value: number) => void;
  onNext: () => void;
}

export function CustomersStep({ inputs, onOverride, onNext }: StepProps) {
  const params = resolveBusinessParams(inputs);
  const current = inputs.daily_customers_override ?? (
    inputs.scale === 'small' ? params.avg_daily_customers_small :
    inputs.scale === 'large' ? params.avg_daily_customers_large :
    params.avg_daily_customers_medium
  );
  const region = inputs.region?.sido ?? null;
  const benchmark = useBenchmarkData(inputs.business_type.id, region);
  const revenueGuide = getRevenueGuideline(benchmark.estimatedMonthlyRevenue, inputs.business_type.name, region);

  return (
    <div className={styles.step}>
      <h2 className={styles.stepTitle}>일 예상 방문객 수</h2>
      <p className={styles.stepDesc}>업계 평균 기준으로 조정해보세요</p>
      <GuidelineBox guideline={revenueGuide ?? getGuideline(inputs.business_type.id, inputs.scale, 'set-customers')} />
      <SliderInput
        label="일 방문객"
        value={current}
        min={5}
        max={500}
        step={5}
        format={v => `${v}명`}
        onChange={v => onOverride('daily_customers_override', v)}
      />
      <button className={styles.nextBtn} onClick={onNext}>다음</button>
    </div>
  );
}

export function TicketStep({ inputs, onOverride, onNext }: StepProps) {
  const params = resolveBusinessParams(inputs);
  const current = inputs.ticket_price_override ?? params.avg_ticket_price;
  const region = inputs.region?.sido ?? null;
  const benchmark = useBenchmarkData(inputs.business_type.id, region);
  const revenueGuide = getRevenueGuideline(benchmark.estimatedMonthlyRevenue, inputs.business_type.name, region);
  const menuItems = getMenuItems(inputs.business_type.id);

  return (
    <div className={styles.step}>
      <h2 className={styles.stepTitle}>한명당 얼마쯤 결제할까요?</h2>
      <p className={styles.stepDesc}>1회 방문당 평균 결제 금액</p>
      <GuidelineBox guideline={revenueGuide ?? getGuideline(inputs.business_type.id, inputs.scale, 'set-ticket')} />
      {menuItems.length > 0 && (
        <div className={styles.menuCards}>
          {menuItems.map((item, i) => (
            <div key={i} className={styles.menuCard}>
              <div className={styles.menuEmoji}>
                {item.emoji}
              </div>
              <div className={styles.menuName}>{item.name}</div>
              <div className={styles.menuPrice}>{formatKRW(item.price)}</div>
            </div>
          ))}
        </div>
      )}
      <SliderInput
        label="객단가"
        value={current}
        min={1000}
        max={100_000}
        step={1000}
        format={formatKRW}
        onChange={v => onOverride('ticket_price_override', v)}
      />
      <button className={styles.nextBtn} onClick={onNext}>다음</button>
    </div>
  );
}

export function LaborStep({ inputs, onOverride, onNext }: StepProps) {
  const [localHeadcount, setLocalHeadcount] = useState(1);
  const [weeklyHours, setWeeklyHours] = useState(40);
  const [hourlyWage, setHourlyWage] = useState(10030);

  const totalLaborCost = localHeadcount * weeklyHours * 4.345 * hourlyWage;
  const perPersonCost = inputs.business_type.labor_cost_monthly_per_person;

  const handleHeadcountChange = (v: number) => {
    setLocalHeadcount(v);
    const newTotal = v * weeklyHours * 4.345 * hourlyWage;
    const effectiveHeadcount = perPersonCost > 0 ? newTotal / perPersonCost : v;
    onOverride('labor_headcount', effectiveHeadcount);
  };

  const handleHoursChange = (v: number) => {
    setWeeklyHours(v);
    const newTotal = localHeadcount * v * 4.345 * hourlyWage;
    const effectiveHeadcount = perPersonCost > 0 ? newTotal / perPersonCost : localHeadcount;
    onOverride('labor_headcount', effectiveHeadcount);
  };

  const handleWageChange = (v: number) => {
    setHourlyWage(v);
    const newTotal = localHeadcount * weeklyHours * 4.345 * v;
    const effectiveHeadcount = perPersonCost > 0 ? newTotal / perPersonCost : localHeadcount;
    onOverride('labor_headcount', effectiveHeadcount);
  };

  return (
    <div className={styles.step}>
      <h2 className={styles.stepTitle}>직원 수</h2>
      <p className={styles.stepDesc}>사장님 제외, 고용 직원 수</p>
      <GuidelineBox guideline={getGuideline(inputs.business_type.id, inputs.scale, 'set-labor')} />
      <div className={styles.sliderGroup}>
        <SliderInput
          label="직원 수"
          value={localHeadcount}
          min={0}
          max={10}
          step={1}
          format={v => `${v} 명`}
          onChange={handleHeadcountChange}
        />
        <SliderInput
          label="주 근무시간"
          value={weeklyHours}
          min={10}
          max={80}
          step={5}
          format={v => `${v} 시간`}
          onChange={handleHoursChange}
        />
        <SliderInput
          label="시급"
          value={hourlyWage}
          min={10030}
          max={30000}
          step={10}
          format={v => `${v.toLocaleString('ko-KR')}원`}
          onChange={handleWageChange}
        />
        <p className={styles.hint}>최저임금은 10,030원이에요 (고용노동부 2025년 고시)</p>
        <p className={styles.totalLabor}>월 총 인건비: {formatKRWShort(totalLaborCost)}</p>
      </div>
      <button className={styles.nextBtn} onClick={onNext}>다음</button>
    </div>
  );
}

export function RentStep({ inputs, onOverride, onNext }: StepProps) {
  const scaleSqm = getScaleSqm(inputs.scale, inputs.business_type.id);
  const regionDefault = inputs.region?.rent_per_sqm
    ? Math.round(inputs.region.rent_per_sqm * scaleSqm)
    : 0;
  const current = inputs.rent_monthly ?? regionDefault;
  const region = inputs.region?.sido ?? null;
  const benchmark = useBenchmarkData(inputs.business_type.id, region);
  const rentGuideline = benchmark.realRent && region ? {
    text: `${region} 소규모상가 ㎡당 월 ${formatKRWShort(benchmark.realRent)}, ${Math.round(scaleSqm)}㎡ 기준 약 ${formatKRWShort(Math.round(benchmark.realRent * scaleSqm))}`,
    source: '한국부동산원 R-ONE 2024년 4분기 기준',
  } : null;

  const rentDeposit = inputs.rent_deposit ?? 50_000_000;

  return (
    <div className={styles.step}>
      <h2 className={styles.stepTitle}>월 임대료</h2>
      <p className={styles.stepDesc}>보증금 제외 월 임대료</p>
      <GuidelineBox guideline={rentGuideline ?? getGuideline(inputs.business_type.id, inputs.scale, 'set-rent')} />
      {benchmark.realRent && inputs.region && (
        <p className={styles.hint}>
          {inputs.region.sido} {inputs.region.sigungu} 평균 임대료율은 ㎡당 {formatKRWShort(benchmark.realRent)}이에요 ({Math.round(scaleSqm)}㎡ 기준 월 약 {formatKRWShort(Math.round(benchmark.realRent * scaleSqm))})
        </p>
      )}
      <SliderInput
        label="월 임대료"
        value={current}
        min={0}
        max={20_000_000}
        step={100_000}
        format={formatKRWShort}
        onChange={v => onOverride('rent_monthly', v)}
      />
      <SliderInput
        label="임대보증금"
        value={rentDeposit}
        min={0}
        max={100_000_000}
        step={5_000_000}
        format={formatKRWShort}
        onChange={v => onOverride('rent_deposit', v)}
      />
      <p style={{ color: '#aaa', fontSize: '12px', margin: '-4px 0 8px 4px' }}>
        임의 값이에요. 실제 계약 조건에 맞게 조정하세요
      </p>
      <button className={styles.nextBtn} onClick={onNext}>다음</button>
    </div>
  );
}

export function MiscStep({ inputs, onOverride, onNext }: StepProps) {
  const [questionIdx, setQuestionIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  const growthRate = inputs.growth_rate ?? 0.00;
  const discountRate = inputs.discount_rate ?? 0.15;

  // discount_rate = (1,000,000 / purchase_price) - 1
  // => purchase_price = 1,000,000 / (discount_rate + 1)
  const rawPurchasePrice = Math.round(1_000_000 / (discountRate + 1) / 10_000) * 10_000;
  const purchasePrice = Math.min(990_000, Math.max(500_000, rawPurchasePrice));
  const calcDiscount = (price: number) => 1_000_000 / price - 1;

  const goNext = (nextIdx: number) => {
    setVisible(false);
    setTimeout(() => {
      setQuestionIdx(nextIdx);
      setVisible(true);
    }, 220);
  };

  const fadeStyle = {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(8px)',
    transition: 'opacity 0.22s ease, transform 0.22s ease',
  };

  return (
    <div className={styles.step}>
      <h2 className={styles.stepTitle}>권리금 계산 설정</h2>
      <p className={styles.stepDesc}>사업체 가치를 추정하기 위한 두 가지 질문이에요</p>

      <div style={fadeStyle}>
        {questionIdx === 0 && (
          <div className={styles.sliderGroup}>
            <p className={styles.questionText}>
              이 사업이 매년 어느 정도 성장할까요?
            </p>
            <SliderInput
              label="연간 매출 성장률"
              value={growthRate}
              min={-0.05}
              max={0.10}
              step={0.01}
              format={v => `${(v * 100).toFixed(0)}%`}
              onChange={v => onOverride('growth_rate', v)}
            />
            <button className={styles.nextBtn} onClick={() => goNext(1)}>다음</button>
          </div>
        )}

        {questionIdx === 1 && (
          <div className={styles.sliderGroup}>
            <p className={styles.questionText}>
              사장님에게 1년 뒤의 100만원은 지금의 얼마와 같나요?
            </p>
            <p className={styles.discountResult}>
              미래의 돈은 지금보다 가치가 낮아요. 이자·위험을 감안해 선택해주세요.
            </p>
            <SliderInput
              label="지금의 가치"
              value={purchasePrice}
              min={500_000}
              max={990_000}
              step={10_000}
              format={formatKRW}
              onChange={v => onOverride('discount_rate', calcDiscount(v))}
            />
            <p className={styles.discountResult}>
              할인율 <strong>{(discountRate * 100).toFixed(1)}%</strong>
            </p>
            <button className={styles.nextBtn} onClick={() => goNext(2)}>다음</button>
          </div>
        )}

        {questionIdx === 2 && (
          <div className={styles.sliderGroup}>
            <p className={styles.questionText}>설정 완료!</p>
            <div className={styles.discountResult}>
              <div>연 성장률: <strong>{(growthRate * 100).toFixed(0)}%</strong></div>
              <div>할인율: <strong>{(discountRate * 100).toFixed(1)}%</strong></div>
            </div>
            <button className={styles.nextBtn} onClick={onNext}>결과 보기</button>
          </div>
        )}
      </div>
    </div>
  );
}
