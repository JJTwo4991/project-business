import { useState, useEffect, useRef } from 'react';

import { getIndustryIcon } from '../../assets/icons';
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

// ─── Discount Story (토스식 순차 텍스트 애니메이션) ──────────────────────────

function DiscountStoryPhase({ inputs, purchasePrice, onChangePurchase, onDone }: {
  inputs: SimulatorInputs;
  purchasePrice: number;
  onChangePurchase: (v: number) => void;
  onDone: () => void;
}) {
  const [visibleLines, setVisibleLines] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bt = inputs.business_type;
  const btIcon = getIndustryIcon(bt.id, bt.category);
  const gap = 1_000_000 - purchasePrice;

  // group: 같은 그룹이면 줄 간격 좁게 (4px), 다른 그룹이면 넓게 (16px)
  // 문단 내 ×0.8, 문단 간 ×1.2
  const LINES = [
    { text: '우리 한번 생각해봐요! 🤔', delay: 1500, group: 0 },           // 문단 간
    { text: '사장님 생각에 이 사업이 1년 동안', delay: 900, group: 1 },     // 문단 내
    { text: '백만원을 벌 것 같다고 해볼게요. (순이익 기준)', delay: 1500, group: 1 }, // 문단 간
    { text: '하지만 사업이 실패할 위험도 있죠.', delay: 900, group: 2 },    // 문단 내
    { text: `${bt.name}은(는) 경쟁이 심한 시장이에요. ${btIcon}`, delay: 900, group: 2 }, // 문단 내
    { text: '그리고 사업에 들어간 대출금 이자도 내셔야 하죠.', delay: 1500, group: 2 }, // 문단 간
    { text: '그런데 누군가 찾아와서,', delay: 900, group: 3 },             // 문단 내
    { text: '이 사업에서 1년 동안 나올 순이익을', delay: 900, group: 3 },   // 문단 내
    { text: '지금 당장 현금으로 사겠다고 합니다.', delay: 1500, group: 3 }, // 문단 간
    { text: 'ask', delay: 1500, group: 4 },                               // 문단 간
  ];

  useEffect(() => {
    if (visibleLines >= LINES.length) return;
    timerRef.current = setTimeout(() => {
      setVisibleLines(v => v + 1);
    }, LINES[visibleLines]?.delay ?? 1000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [visibleLines]);

  const [showSlider, setShowSlider] = useState(false);
  const allLinesShown = visibleLines >= LINES.length;

  useEffect(() => {
    if (!allLinesShown) return;
    const t = setTimeout(() => setShowSlider(true), 1000);
    return () => clearTimeout(t);
  }, [allLinesShown]);

  return (
    <div className={styles.step} style={{ gap: '20px' }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {LINES.slice(0, visibleLines).map((line, i) => {
          const prevGroup = i > 0 ? LINES[i - 1].group : -1;
          const sameGroup = line.group === prevGroup;
          const marginTop = i === 0 ? '0' : sameGroup ? '4px' : '16px';

          if (line.text === 'ask') {
            return (
              <p key={i} style={{
                fontSize: '18px', fontWeight: 800, color: 'var(--color-text)',
                lineHeight: 1.5, margin: 0, marginTop,
                animation: 'storyFadeIn 0.5s ease',
              }}>
                얼마를 받고 넘기시겠어요? 💵
              </p>
            );
          }
          return (
            <p key={i} style={{
              fontSize: '15px', color: 'var(--color-text)',
              lineHeight: 1.65, margin: 0, marginTop,
              animation: 'storyFadeIn 0.5s ease',
            }}>
              {line.text}
            </p>
          );
        })}
      </div>

      {showSlider && (
        <div style={{ animation: 'storyFadeIn 0.5s ease' }}>
          <div className={styles.sliderGroup}>
            <SliderInput
              label="지금 받을 금액"
              value={purchasePrice}
              min={500_000}
              max={990_000}
              step={10_000}
              format={formatKRW}
              onChange={onChangePurchase}
            />
          </div>
          <p style={{ textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '13px', margin: '12px 0' }}>
            {formatKRWShort(gap)}을 사업 위험과 기다림의 비용으로 생각하셨네요
          </p>
          <button className={styles.nextBtn} onClick={onDone}>이 금액으로 결정하기</button>
        </div>
      )}
    </div>
  );
}

type MiscPhase = 'intro' | 'growth' | 'discount' | 'done';

export function MiscStep({ inputs, onOverride, onNext, registerBackHandler }: StepProps & { registerBackHandler?: (handler: (() => boolean) | null) => void }) {
  const [phase, setPhase] = useState<MiscPhase>('intro');
  const [transPhase, setTransPhase] = useState<'emojiIn' | 'hold' | 'moveUp' | 'btnWait' | 'btnIn' | 'idle'>('emojiIn');

  // 내부 phase 뒤로가기
  useEffect(() => {
    if (!registerBackHandler) return;
    const handler = () => {
      const backMap: Partial<Record<MiscPhase, MiscPhase>> = {
        'growth': 'intro',
        'discount': 'growth',
      };
      const prev = backMap[phase];
      if (prev) { setPhase(prev); return true; }
      return false; // intro → 일반 뒤로가기
    };
    registerBackHandler(handler);
    return () => registerBackHandler(null);
  }, [registerBackHandler, phase]);

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
            <p className={styles.miscTransTitle}>내 사업의 가치를{'\n'}계산해볼까요?</p>
            <p className={styles.miscTransSub}>
              사장님이 예상한 대로 매달 돈을 번다면,
              {'\n'}이 사업체는 얼마의 가치가 있을까요?
              {'\n\n'}이 금액이 나중에 가게를 넘길 때
              {'\n'}권리금의 기준이 될 수 있어요.
              {'\n\n'}간단한 두 가지만 물어볼게요.
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
    const growthHint = growthRate < 0
      ? '경기나 업종 상황이 어려울 것 같다면 보수적으로 잡아보세요'
      : growthRate === 0
      ? '꾸준히 현재 매출을 유지하는 것도 대단한 일이에요'
      : growthRate <= 0.03
      ? '안정적인 성장을 기대하고 계시네요'
      : '공격적인 성장 목표네요! 기대됩니다';
    return (
      <div className={styles.step}>
        <h2 className={styles.stepTitle}>내년도 매출 성장률</h2>
        <p className={styles.stepDesc}>사장님의 사업 매출이 내년에는 얼마나 오를까요?</p>
        <div className={styles.disclaimer} style={{ textAlign: 'center', color: 'var(--color-primary)', marginBottom: '8px' }}>
          {growthHint}
        </div>
        <div className={styles.sliderGroup}>
          <SliderInput
            label="연간 매출 성장률"
            value={growthRate}
            min={-0.10}
            max={0.10}
            step={0.01}
            format={v => `${v > 0 ? '+' : ''}${(v * 100).toFixed(0)}%`}
            onChange={v => onOverride('growth_rate', v)}
          />
        </div>
        <button className={styles.nextBtn} onClick={() => setPhase('discount')}>다음</button>
      </div>
    );
  }

  if (phase === 'discount') {
    return <DiscountStoryPhase
      inputs={inputs}
      purchasePrice={purchasePrice}
      onChangePurchase={v => onOverride('discount_rate', calcDiscount(v))}
      onDone={onNext}
    />;
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
