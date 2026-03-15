import { useState, useCallback } from 'react';
import styles from './VisitorEstimation.module.css';
import { UI_ICONS } from '../../assets/icons';

// ─── Types ────────────────────────────────────────────────────────────────────

type DayKey = '월' | '화' | '수' | '목' | '금' | '토' | '일';
const ALL_DAYS: DayKey[] = ['월', '화', '수', '목', '금', '토', '일'];

type QuestionId =
  | 'q1-days'
  | 'q2-hours'
  | 'q3-busy-days'
  | 'q4-busy-visitors'
  | 'q5-normal-visitors'
  | 'summary';

interface VisitorEstimationStepProps {
  onComplete: (dailyCustomers: number, monthlyOperatingDays: number) => void;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface TimePairProps {
  openHour: number;
  closeHour: number;
  onChangeOpen: (h: number) => void;
  onChangeClose: (h: number) => void;
}

function TimePair({ openHour, closeHour, onChangeOpen, onChangeClose }: TimePairProps) {
  const hours = Math.max(0, closeHour - openHour);
  return (
    <div className={styles.questionContainer} style={{ gap: 16 }}>
      <div className={styles.timePicker}>
        <span className={styles.timePickerLabel}>열기</span>
        <div className={styles.timePickerGroup}>
          <button
            className={styles.timeAdjBtn}
            onClick={() => onChangeOpen(Math.max(0, openHour - 1))}
            disabled={openHour <= 0}
            aria-label="영업 시작 시간 줄이기"
          >−</button>
          <span className={styles.timeValue}>{openHour}시</span>
          <button
            className={styles.timeAdjBtn}
            onClick={() => onChangeOpen(Math.min(closeHour - 1, openHour + 1))}
            disabled={openHour >= closeHour - 1}
            aria-label="영업 시작 시간 늘리기"
          >+</button>
        </div>
        <span className={styles.timePickerLabel} style={{ marginLeft: 16 }}>닫기</span>
        <div className={styles.timePickerGroup}>
          <button
            className={styles.timeAdjBtn}
            onClick={() => onChangeClose(Math.max(openHour + 1, closeHour - 1))}
            disabled={closeHour <= openHour + 1}
            aria-label="영업 마감 시간 줄이기"
          >−</button>
          <span className={styles.timeValue}>{closeHour}시</span>
          <button
            className={styles.timeAdjBtn}
            onClick={() => onChangeClose(Math.min(24, closeHour + 1))}
            disabled={closeHour >= 24}
            aria-label="영업 마감 시간 늘리기"
          >+</button>
        </div>
      </div>
      <p className={styles.timeCalc}>
        하루 <span className={styles.timeCalcHighlight}>
          {openHour === 0 && closeHour === 24 ? '24시간' : `${hours}시간`}
        </span> 영업
      </p>
    </div>
  );
}

// ─── Reality Check ────────────────────────────────────────────────────────────

function getRealityColor(visitors: number): { className: string; label: string } {
  if (visitors <= 15) return { className: styles.realityGreen, label: '여유 있는 수준' };
  if (visitors <= 60) return { className: styles.realityBlue, label: '적당한 수준' };
  if (visitors <= 100) return { className: styles.realityOrange, label: '꽤 바쁜 수준' };
  return { className: styles.realityRed, label: '매우 바쁜 수준' };
}

interface RealityCheckProps {
  visitors: number;
  totalHours: number;
}

function RealityCheck({ visitors, totalHours }: RealityCheckProps) {
  const totalMinutes = totalHours * 60;
  const minutesPerCustomer = visitors > 0 ? Math.round(totalMinutes / visitors) : 0;
  const { className: colorClass, label } = getRealityColor(visitors);
  const capacityPercent = Math.min(100, (visitors / 120) * 100);

  return (
    <div className={styles.realityCard}>
      <div className={styles.realityHeader}>
        <div className={styles.realityIcon}>⏱</div>
        <span className={styles.realityTitle}>리얼리티 체크</span>
      </div>
      <div className={`${styles.realityBig} ${colorClass}`}>
        {visitors > 0 ? `약 ${minutesPerCustomer}분에 1명` : '—'}
      </div>
      <p className={styles.realityDesc}>
        {totalHours}시간 영업 기준, {visitors}명이면
        <br />
        <strong>{minutesPerCustomer}분마다 새 손님 1명</strong>이 와야 해요
      </p>
      <p className={styles.realityLabel}>{label}</p>
      <div className={styles.capacityBarWrap}>
        <div className={styles.capacityLabelRow}>
          <span>여유</span><span>적정</span><span>포화</span>
        </div>
        <div className={styles.capacityBar}>
          <div
            className={`${styles.capacityFill} ${colorClass}`}
            style={{ width: `${capacityPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Preset buttons ───────────────────────────────────────────────────────────

const PRESETS = [
  { label: '~20', value: 10 },
  { label: '20~50', value: 35 },
  { label: '50~100', value: 75 },
  { label: '100+', value: 130 },
];

function getActivePreset(v: number): number {
  if (v <= 20) return 0;
  if (v <= 50) return 1;
  if (v <= 100) return 2;
  return 3;
}

// ─── Daily Visitor Input ──────────────────────────────────────────────────────

interface DailyVisitorInputProps {
  value: number;
  onChange: (v: number) => void;
  totalHours: number;
  emoji: string;
  title: string;
  dayLabel: string;
}

function DailyVisitorInput({ value, onChange, totalHours, emoji, title, dayLabel }: DailyVisitorInputProps) {
  const activePreset = getActivePreset(value);

  return (
    <>
      <div className={styles.dayCategoryHeader}>
        <span className={styles.dayCategoryEmoji}>{emoji}</span>
        <h2 className={styles.questionLabel}>{title}</h2>
      </div>
      <p className={styles.questionSub}>
        {dayLabel}에 하루 몇 명이 올 것 같으세요?
      </p>

      <div className={styles.presetRow}>
        {PRESETS.map((p, i) => (
          <button
            key={p.label}
            className={`${styles.presetBtn} ${i === activePreset ? styles.presetBtnActive : ''}`}
            onClick={() => onChange(p.value)}
            type="button"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className={styles.bigNumberWrap}>
        <span className={styles.bigNumber}>{value}</span>
        <span className={styles.bigUnit}>명/일</span>
      </div>

      <div className={styles.visitorSliderWrap}>
        <input
          className={styles.sliderTrack}
          type="range"
          min={1}
          max={200}
          step={1}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          aria-label={`${title} 하루 방문객`}
        />
      </div>

      <RealityCheck visitors={value} totalHours={totalHours} />
    </>
  );
}

// ─── Summary screen ───────────────────────────────────────────────────────────

interface SummaryData {
  busyDays: DayKey[];
  normalDays: DayKey[];
  busyDailyVisitors: number;
  normalDailyVisitors: number;
  avgDaily: number;
  weeklyTotal: number;
}

function SummaryScreen({ data, onNext }: { data: SummaryData; onNext: () => void }) {
  const [phase, setPhase] = useState<'emojiIn' | 'hold' | 'moveUp' | 'btnWait' | 'btnIn' | 'idle'>('emojiIn');

  let breakdownLine: string | null = null;
  if (data.busyDays.length > 0 && data.normalDays.length > 0) {
    breakdownLine = `바쁜 날: 하루 ${data.busyDailyVisitors}명\n안 바쁜 날: 하루 ${data.normalDailyVisitors}명`;
  } else if (data.busyDays.length > 0) {
    breakdownLine = `하루 평균 ${data.busyDailyVisitors}명`;
  }

  function handleEmojiInEnd() {
    setPhase('hold');
    setTimeout(() => setPhase('moveUp'), 800);
  }

  function handleTextInEnd() {
    setPhase('btnWait');
    setTimeout(() => setPhase('btnIn'), 1000);
  }

  const showText = phase === 'moveUp' || phase === 'btnWait' || phase === 'btnIn' || phase === 'idle';
  const showBtn = phase === 'btnIn' || phase === 'idle';
  const movedUp = phase !== 'emojiIn' && phase !== 'hold';

  return (
    <div className={styles.summaryScreen}>
      <span
        className={`${styles.summaryEmoji} ${movedUp ? styles.summaryEmojiUp : ''} ${phase === 'emojiIn' ? styles.summaryFadeIn : ''}`}
        onAnimationEnd={phase === 'emojiIn' ? handleEmojiInEnd : undefined}
        aria-hidden="true"
      >
        {UI_ICONS.confetti}
      </span>

      {showText && (
        <div
          className={`${styles.summaryTextBlock} ${styles.summarySlideUp}`}
          onAnimationEnd={phase === 'moveUp' ? handleTextInEnd : undefined}
        >
          <p className={styles.summaryTitle}>대단해요!</p>
          <p className={styles.summaryMessage}>
            {`일주일에 약 ${data.weeklyTotal}명이\n방문할 예정이에요!`}
          </p>
          {breakdownLine && (
            <p className={styles.summaryBreakdown}>{breakdownLine}</p>
          )}
        </div>
      )}

      {showBtn && (
        <div className={`${styles.summaryBtnWrap} ${styles.summarySlideUp}`}
          onAnimationEnd={phase === 'btnIn' ? () => setPhase('idle') : undefined}
        >
          <button className={styles.nextBtn} onClick={onNext} type="button">
            다음으로
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function VisitorEstimationStep({ onComplete }: VisitorEstimationStepProps) {
  // Q1
  const [selectedDays, setSelectedDays] = useState<DayKey[]>(['월', '화', '수', '목', '금', '토']);
  // Q2
  const [openHour, setOpenHour] = useState<number>(10);
  const [closeHour, setCloseHour] = useState<number>(22);
  // Q3
  const [busyDays, setBusyDays] = useState<DayKey[]>([]);
  // Q4 – 바쁜 날 하루 방문객
  const [busyVisitors, setBusyVisitors] = useState<number>(45);
  // Q5 – 일반 날 하루 방문객
  const [normalVisitors, setNormalVisitors] = useState<number>(20);

  // Animation state
  const [animState, setAnimState] = useState<'entering' | 'idle' | 'exiting'>('entering');
  const [currentQ, setCurrentQ] = useState<QuestionId>('q1-days');
  const [pendingQ, setPendingQ] = useState<QuestionId | null>(null);

  const totalHours = Math.max(0, closeHour - openHour);
  const operatingDays = selectedDays.length;

  const activeDays = ALL_DAYS.filter(d => selectedDays.includes(d));
  const busyActiveDays = busyDays.filter(d => activeDays.includes(d));
  const normalActiveDays = activeDays.filter(d => !busyActiveDays.includes(d));

  // ─── Navigation ───────────────────────────────────────────────────────────

  const advanceTo = useCallback((next: QuestionId) => {
    setAnimState('exiting');
    setPendingQ(next);
  }, []);

  function handleExitDone() {
    if (pendingQ) {
      setCurrentQ(pendingQ);
      setPendingQ(null);
      setAnimState('entering');
    }
  }

  function handleEnterDone() {
    setAnimState('idle');
  }

  function goBack(from: QuestionId) {
    const backMap: Partial<Record<QuestionId, QuestionId>> = {
      'q2-hours': 'q1-days',
      'q3-busy-days': 'q2-hours',
      'q4-busy-visitors': 'q3-busy-days',
      'q5-normal-visitors': busyActiveDays.length > 0 ? 'q4-busy-visitors' : 'q3-busy-days',
      'summary': normalActiveDays.length > 0 ? 'q5-normal-visitors' : 'q4-busy-visitors',
    };
    const prev = backMap[from];
    if (prev) advanceTo(prev);
  }

  // ─── Q3: skip handler (모든 요일 비슷) ──────────────────────────────────────

  function handleSkipBusy() {
    setBusyDays([]);
    // 구분 없이 전체 평균 → Q5 하나만 (일반 날 = 모든 날)
    advanceTo('q5-normal-visitors');
  }

  // ─── Flow ───────────────────────────────────────────────────────────────────

  function handleQ3Next() {
    if (busyActiveDays.length > 0) {
      advanceTo('q4-busy-visitors');
    } else {
      advanceTo('q5-normal-visitors');
    }
  }

  function handleQ4Next() {
    if (normalActiveDays.length > 0) {
      advanceTo('q5-normal-visitors');
    } else {
      advanceTo('summary');
    }
  }

  // ─── Final submit ─────────────────────────────────────────────────────────

  function handleFinish() {
    let avgPerOperatingDay: number;
    if (busyActiveDays.length > 0 && normalActiveDays.length > 0) {
      // 바쁜 날/일반 날 가중 평균
      const total = busyActiveDays.length * busyVisitors + normalActiveDays.length * normalVisitors;
      avgPerOperatingDay = Math.round(total / activeDays.length);
    } else if (busyActiveDays.length > 0) {
      avgPerOperatingDay = busyVisitors;
    } else {
      avgPerOperatingDay = normalVisitors;
    }
    // 주 영업일수 → 월 영업일수 (× 4.345주)
    const monthlyOperatingDays = Math.round(operatingDays * 4.345);
    onComplete(avgPerOperatingDay, monthlyOperatingDays);
  }

  function getSummaryData(): SummaryData {
    let weeklyTotal: number;
    if (busyActiveDays.length > 0) {
      weeklyTotal = busyActiveDays.length * busyVisitors + normalActiveDays.length * normalVisitors;
    } else {
      weeklyTotal = activeDays.length * normalVisitors;
    }
    const avgDaily = Math.round(weeklyTotal / 7);
    return {
      busyDays: busyActiveDays,
      normalDays: normalActiveDays,
      busyDailyVisitors: busyVisitors,
      normalDailyVisitors: normalVisitors,
      avgDaily,
      weeklyTotal,
    };
  }

  // ─── Animation class ──────────────────────────────────────────────────────

  const animClass =
    animState === 'entering' ? styles.questionEnter
    : animState === 'exiting' ? styles.questionExit
    : '';

  // ─── Render ───────────────────────────────────────────────────────────────

  function renderQuestion() {
    function BackButton({ q }: { q: QuestionId }) {
      return (
        <button className={styles.skipBtn} onClick={() => goBack(q)} type="button">
          이전
        </button>
      );
    }

    switch (currentQ) {
      // ── Q1: operating days ───────────────────────────────────────────────
      case 'q1-days':
        return (
          <div className={styles.step}>
            <div
              key="q1"
              className={`${styles.questionContainer} ${animClass}`}
              onAnimationEnd={animState === 'exiting' ? handleExitDone : handleEnterDone}
            >
              <h2 className={styles.questionLabel}>어떤 요일에 영업하실 건가요?</h2>
              <div className={styles.dayToggleRow}>
                {ALL_DAYS.map(day => {
                  const isActive = selectedDays.includes(day);
                  return (
                    <button
                      key={day}
                      className={`${styles.dayToggle} ${isActive ? styles.dayToggleActive : ''}`}
                      onClick={() => {
                        setSelectedDays(prev => {
                          const next = isActive
                            ? prev.filter(d => d !== day)
                            : [...prev, day];
                          if (isActive) {
                            setBusyDays(bd => bd.filter(d => d !== day));
                          }
                          return next;
                        });
                      }}
                      type="button"
                      aria-pressed={isActive}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
              <p className={styles.dayToggleHint}>
                {operatingDays}일 선택됨
              </p>
              <button
                className={styles.nextBtn}
                onClick={() => advanceTo('q2-hours')}
                type="button"
                disabled={operatingDays === 0}
              >
                다음
              </button>
            </div>
          </div>
        );

      // ── Q2: opening hours ────────────────────────────────────────────────
      case 'q2-hours':
        return (
          <div className={styles.step}>
            <div
              key="q2"
              className={`${styles.questionContainer} ${animClass}`}
              onAnimationEnd={animState === 'exiting' ? handleExitDone : handleEnterDone}
            >
              <h2 className={styles.questionLabel}>몇 시부터 몇 시까지 영업하실 건가요?</h2>
              <TimePair
                openHour={openHour}
                closeHour={closeHour}
                onChangeOpen={h => setOpenHour(Math.min(h, closeHour - 1))}
                onChangeClose={h => setCloseHour(Math.max(h, openHour + 1))}
              />
              <button className={styles.nextBtn} onClick={() => advanceTo('q3-busy-days')} type="button">
                다음
              </button>
              <BackButton q="q2-hours" />
            </div>
          </div>
        );

      // ── Q3: busy days selection ──────────────────────────────────────────
      case 'q3-busy-days': {
        const allBusySelected = busyDays.filter(d => activeDays.includes(d)).length === activeDays.length;
        return (
          <div className={styles.step}>
            <div
              key="q3"
              className={`${styles.questionContainer} ${animClass}`}
              onAnimationEnd={animState === 'exiting' ? handleExitDone : handleEnterDone}
            >
              <h2 className={styles.questionLabel}>장사가 잘 되는 요일이 있나요?</h2>
              <p className={styles.questionSub}>
                특별히 바쁜 요일을 골라주세요.
              </p>
              <div className={styles.dayToggleRow}>
                {activeDays.map(day => {
                  const isActive = busyDays.includes(day);
                  return (
                    <button
                      key={day}
                      className={`${styles.dayToggle} ${isActive ? styles.dayToggleBusy : ''}`}
                      onClick={() => {
                        if (!isActive && allBusySelected) return;
                        setBusyDays(prev =>
                          isActive ? prev.filter(d => d !== day) : [...prev, day]
                        );
                      }}
                      type="button"
                      aria-pressed={isActive}
                      disabled={!isActive && allBusySelected}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
              {busyActiveDays.length > 0 && (
                <p className={styles.dayToggleHint}>
                  🔥 {busyActiveDays.join(', ')} — 바쁜 날 {busyActiveDays.length}일 선택됨
                </p>
              )}
              <button
                className={styles.nextBtn}
                onClick={handleQ3Next}
                type="button"
              >
                다음
              </button>
              <button className={styles.skipBtn} onClick={handleSkipBusy} type="button">
                모든 요일이 비슷해요 (건너뛰기)
              </button>
              <BackButton q="q3-busy-days" />
            </div>
          </div>
        );
      }

      // ── Q4: 바쁜 날 하루 방문객 ──────────────────────────────────────────
      case 'q4-busy-visitors':
        return (
          <div className={styles.step}>
            <div
              key="q4"
              className={`${styles.questionContainer} ${animClass}`}
              onAnimationEnd={animState === 'exiting' ? handleExitDone : handleEnterDone}
            >
              <DailyVisitorInput
                value={busyVisitors}
                onChange={setBusyVisitors}
                totalHours={totalHours}
                emoji="🔥"
                title="바쁜 날"
                dayLabel={busyActiveDays.join(', ')}
              />
              <button className={styles.nextBtn} onClick={handleQ4Next} type="button">
                다음
              </button>
              <BackButton q="q4-busy-visitors" />
            </div>
          </div>
        );

      // ── Q5: 일반 날 하루 방문객 ──────────────────────────────────────────
      case 'q5-normal-visitors': {
        const isAllDaysSame = busyActiveDays.length === 0;
        const dayLabel = isAllDaysSame
          ? activeDays.join(', ')
          : normalActiveDays.join(', ');

        return (
          <div className={styles.step}>
            <div
              key="q5"
              className={`${styles.questionContainer} ${animClass}`}
              onAnimationEnd={animState === 'exiting' ? handleExitDone : handleEnterDone}
            >
              <DailyVisitorInput
                value={normalVisitors}
                onChange={setNormalVisitors}
                totalHours={totalHours}
                emoji={isAllDaysSame ? '👥' : '☕'}
                title={isAllDaysSame ? '하루 방문객' : '일반적인 날'}
                dayLabel={dayLabel}
              />
              <button className={styles.nextBtn} onClick={() => advanceTo('summary')} type="button">
                다음
              </button>
              <BackButton q="q5-normal-visitors" />
            </div>
          </div>
        );
      }

      // ── Summary ───────────────────────────────────────────────────────────
      case 'summary':
        return (
          <div
            key="summary"
            className={animClass}
            onAnimationEnd={animState === 'exiting' ? handleExitDone : handleEnterDone}
          >
            <SummaryScreen data={getSummaryData()} onNext={handleFinish} />
          </div>
        );

      default:
        return null;
    }
  }

  return <>{renderQuestion()}</>;
}
