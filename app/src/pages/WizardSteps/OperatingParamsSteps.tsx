import styles from './WizardSteps.module.css';
import { SliderInput } from '../../components/SliderInput/SliderInput';
import type { SimulatorInputs } from '../../types';
import { formatKRW, formatKRWShort } from '../../lib/format';
import { resolveBusinessParams } from '../../lib/calculator';
import { getScaleSqm } from '../../lib/scale';
import { GuidelineBox } from '../../components/GuidelineBox/GuidelineBox';
import { getGuideline, getRevenueGuideline } from '../../data/guidelines';
import { useBenchmarkData } from '../../hooks/useBenchmarkData';

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

  return (
    <div className={styles.step}>
      <h2 className={styles.stepTitle}>평균 객단가</h2>
      <p className={styles.stepDesc}>1회 방문당 평균 결제 금액</p>
      <GuidelineBox guideline={revenueGuide ?? getGuideline(inputs.business_type.id, inputs.scale, 'set-ticket')} />
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
  const current = inputs.labor_headcount ?? 1;

  return (
    <div className={styles.step}>
      <h2 className={styles.stepTitle}>직원 수</h2>
      <p className={styles.stepDesc}>사장님 제외, 고용 직원 수</p>
      <GuidelineBox guideline={getGuideline(inputs.business_type.id, inputs.scale, 'set-labor')} />
      <SliderInput
        label="직원 수"
        value={current}
        min={0}
        max={10}
        step={1}
        format={v => `${v}명`}
        onChange={v => onOverride('labor_headcount', v)}
      />
      <p className={styles.hint}>
        인건비: {formatKRWShort(inputs.business_type.labor_cost_monthly_per_person)}/인
      </p>
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
      <GuidelineBox guideline={rentGuideline} />
      <SliderInput
        label="월 임대료"
        value={current}
        min={0}
        max={200_000_000}
        step={100_000}
        format={formatKRWShort}
        onChange={v => onOverride('rent_monthly', v)}
      />
      <SliderInput
        label="임대보증금"
        value={rentDeposit}
        min={0}
        max={300_000_000}
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
  const discountRate = inputs.discount_rate ?? 0.15;
  // Convert discount_rate back to purchase price (원 단위)
  // discount_rate = (1,000,000 / purchase_price) - 1
  // => purchase_price = 1,000,000 / (discount_rate + 1)
  const rawPurchasePrice = Math.round(1_000_000 / (discountRate + 1) / 10_000) * 10_000;
  // Clamp to slider range [500,000 .. 990,000]
  const purchasePrice = Math.min(990_000, Math.max(500_000, rawPurchasePrice));
  const calcDiscount = (price: number) => {
    // discount_rate = (FV / PV) - 1 = (1,000,000 / price) - 1
    return 1_000_000 / price - 1;
  };

  return (
    <div className={styles.step}>
      <h2 className={styles.stepTitle}>권리금 계산을 위한 설정</h2>
      <p className={styles.stepDesc}>사업체 가치(권리금)를 추정하기 위한 설정입니다</p>
      <div className={styles.sliderGroup}>
        <p className={styles.questionText}>
          사장님의 사업이 앞으로 1년 동안 딱 100만원만 벌고 폐업해야 한다고 가정해볼게요.<br />
          사장님이 돈이 필요하여 이 사업을 매각하려고 해요.<br />
          향후 1년간 100만원을 벌어다 주는 이 사업을 현재 얼마에 매각하시겠어요?<br />
          (1년 동안의 이자, 사업의 위험성 등이 반영되어야 해요)
        </p>
        <SliderInput
          label="매각 금액"
          value={purchasePrice}
          min={500_000}
          max={990_000}
          step={10_000}
          format={formatKRW}
          onChange={v => onOverride('discount_rate', calcDiscount(v))}
        />
        <p className={styles.discountResult}>
          그렇다면 재무적 개념의 할인율은 <strong>{(discountRate * 100).toFixed(1)}%</strong> 에요
        </p>
        <p className={styles.questionText}>
          앞으로 매출이 매년 몇 % 성장할 것 같으세요?
        </p>
        <SliderInput
          label="연간 매출 성장률"
          value={inputs.growth_rate ?? 0.00}
          min={-0.05}
          max={0.10}
          step={0.01}
          format={v => `${(v * 100).toFixed(0)}%`}
          onChange={v => onOverride('growth_rate', v)}
        />
      </div>
      <button className={styles.nextBtn} onClick={onNext}>다음</button>
    </div>
  );
}
