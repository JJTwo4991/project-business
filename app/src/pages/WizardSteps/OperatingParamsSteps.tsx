import { useState } from 'react';
import styles from './WizardSteps.module.css';
import { SliderInput } from '../../components/SliderInput/SliderInput';
import type { SimulatorInputs } from '../../types';
import { formatKRW, formatKRWShort } from '../../lib/format';
import { resolveBusinessParams } from '../../lib/calculator';
import { getScaleSqm } from '../../lib/scale';
import { GuidelineBox } from '../../components/GuidelineBox/GuidelineBox';
import { getGuideline } from '../../data/guidelines';
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
  return (
    <div className={styles.step}>
      <h2 className={styles.stepTitle}>일 예상 방문객 수</h2>
      <p className={styles.stepDesc}>업계 평균 기준으로 조정해보세요</p>
      <GuidelineBox guideline={getGuideline(inputs.business_type.id, inputs.scale, 'set-customers')} />
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
  const menuItems = getMenuItems(inputs.business_type.id);

  return (
    <div className={styles.step}>
      <h2 className={styles.stepTitle}>한명당 얼마쯤 결제할까요?</h2>
      <p className={styles.stepDesc}>1회 방문당 평균 결제 금액</p>
      <GuidelineBox guideline={getGuideline(inputs.business_type.id, inputs.scale, 'set-ticket')} />
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

  const calcEffectiveHeadcount = (heads: number, hours: number, wage: number) => {
    const total = heads * hours * 4.345 * wage;
    return perPersonCost > 0 ? Math.round((total / perPersonCost) * 100) / 100 : heads;
  };

  const handleHeadcountChange = (v: number) => {
    setLocalHeadcount(v);
    onOverride('labor_headcount', calcEffectiveHeadcount(v, weeklyHours, hourlyWage));
  };

  const handleHoursChange = (v: number) => {
    setWeeklyHours(v);
    onOverride('labor_headcount', calcEffectiveHeadcount(localHeadcount, v, hourlyWage));
  };

  const handleWageChange = (v: number) => {
    setHourlyWage(v);
    onOverride('labor_headcount', calcEffectiveHeadcount(localHeadcount, weeklyHours, v));
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

  const rentDeposit = inputs.rent_deposit ?? 50_000_000;

  return (
    <div className={styles.step}>
      <h2 className={styles.stepTitle}>월 임대료</h2>
      <p className={styles.stepDesc}>보증금 제외 월 임대료</p>
      <GuidelineBox guideline={getGuideline(inputs.business_type.id, inputs.scale, 'set-rent')} />
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

type MiscPhase = 'intro' | 'growth' | 'discount' | 'done';

export function MiscStep({ inputs, onOverride, onNext }: StepProps) {
  const [phase, setPhase] = useState<MiscPhase>('intro');
  const [transPhase, setTransPhase] = useState<'emojiIn' | 'hold' | 'moveUp' | 'btnWait' | 'btnIn' | 'idle'>('emojiIn');

  const growthRate = inputs.growth_rate ?? 0.00;
  const discountRate = inputs.discount_rate ?? 0.15;

  const rawPurchasePrice = Math.round(1_000_000 / (discountRate + 1) / 10_000) * 10_000;
  const purchasePrice = Math.min(990_000, Math.max(500_000, rawPurchasePrice));
  const calcDiscount = (price: number) => 1_000_000 / price - 1;

  // Transition handlers
  function handleEmojiInEnd() {
    setTransPhase('hold');
    setTimeout(() => setTransPhase('moveUp'), 800);
  }
  function handleTextInEnd() {
    setTransPhase('btnWait');
    setTimeout(() => setTransPhase('btnIn'), 1000);
  }

  const showTransText = transPhase === 'moveUp' || transPhase === 'btnWait' || transPhase === 'btnIn' || transPhase === 'idle';
  const showTransBtn = transPhase === 'btnIn' || transPhase === 'idle';
  const transMovedUp = transPhase !== 'emojiIn' && transPhase !== 'hold';

  if (phase === 'intro') {
    return (
      <div className={styles.miscTransScreen}>
        <span
          className={`${styles.miscTransEmoji} ${transMovedUp ? styles.miscTransEmojiUp : ''} ${transPhase === 'emojiIn' ? styles.miscTransFadeIn : ''}`}
          onAnimationEnd={transPhase === 'emojiIn' ? handleEmojiInEnd : undefined}
        >💰</span>
        {showTransText && (
          <div
            className={`${styles.miscTransText} ${styles.miscTransSlideUp}`}
            onAnimationEnd={transPhase === 'moveUp' ? handleTextInEnd : undefined}
          >
            <p className={styles.miscTransTitle}>권리금을 계산해볼까요?</p>
            <p className={styles.miscTransSub}>
              현재의 돈은 미래의 돈보다 가치가 높아요.
              {'\n'}이자도 내야 하고, 예상만큼 못 벌 수도 있으니까요.
              {'\n\n'}두 가지만 여쭤볼게요.
            </p>
          </div>
        )}
        {showTransBtn && (
          <div className={`${styles.miscTransBtnWrap} ${styles.miscTransSlideUp}`}>
            <button className={styles.nextBtn} onClick={() => setPhase('growth')} type="button">좋아요</button>
          </div>
        )}
      </div>
    );
  }

  if (phase === 'growth') {
    return (
      <div className={styles.step}>
        <h2 className={styles.stepTitle}>내년도 매출 성장률</h2>
        <p className={styles.stepDesc}>이 사업이 내년에 얼마나 성장할까요?</p>
        <div className={styles.sliderGroup}>
          <SliderInput
            label="연간 매출 성장률"
            value={growthRate}
            min={-0.05}
            max={0.10}
            step={0.01}
            format={v => `${(v * 100).toFixed(0)}%`}
            onChange={v => onOverride('growth_rate', v)}
          />
        </div>
        <button className={styles.nextBtn} onClick={() => setPhase('discount')}>다음</button>
      </div>
    );
  }

  if (phase === 'discount') {
    return (
      <div className={styles.step}>
        <h2 className={styles.stepTitle}>지금의 가치</h2>
        <p className={styles.stepDesc}>
          누군가 와서 이렇게 말했어요.
        </p>
        <div style={{
          background: 'var(--color-primary-light)',
          borderRadius: '12px',
          padding: '16px 20px',
          margin: '0 0 16px',
          lineHeight: 1.7,
          fontSize: '14px',
          color: 'var(--color-text)',
        }}>
          "지금 <strong>{formatKRW(purchasePrice)}</strong>을 줄 테니,
          {'\n'}1년 뒤에 이 사업에서 벌어들일
          {'\n'}<strong>100만원</strong>을 저한테 주세요."
        </div>
        <p className={styles.questionText} style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 12px' }}>
          사장님은 얼마에 파실 건가요?
        </p>
        <div className={styles.sliderGroup}>
          <SliderInput
            label="지금 받을 금액"
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
        </div>
        <button className={styles.nextBtn} onClick={() => setPhase('done')}>다음</button>
      </div>
    );
  }

  // done
  return (
    <div className={styles.step}>
      <h2 className={styles.stepTitle}>설정 완료!</h2>
      <div className={styles.sliderGroup}>
        <div className={styles.discountResult}>
          <div>연 성장률: <strong>{(growthRate * 100).toFixed(0)}%</strong></div>
          <div>할인율: <strong>{(discountRate * 100).toFixed(1)}%</strong></div>
        </div>
      </div>
      <button className={styles.nextBtn} onClick={onNext}>결과 보기</button>
    </div>
  );
}
