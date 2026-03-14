import { useState, useCallback } from 'react';
import styles from './VisitorEstimation.module.css';
import { UI_ICONS } from '../../assets/icons';
import { TossTransition } from '../../components/TossTransition/TossTransition';

// ─── Types ────────────────────────────────────────────────────────────────────

type DayKey = '월' | '화' | '수' | '목' | '금' | '토' | '일';
const ALL_DAYS: DayKey[] = ['월', '화', '수', '목', '금', '토', '일'];

type QuestionId =
  | 'q1-days'
  | 'q2-hours'
  | 'q3-busy-days'
  | 'transition-busy'
  | 'q4-slow-hours-busy'
  | 'q5-slow-rate-busy'
  | 'q6-busy-rate-busy'
  | 'transition-normal'
  | 'q7-slow-hours-normal'
  | 'q8-slow-rate-normal'
  | 'q9-busy-rate-normal'
  | 'summary';

interface VisitorEstimationStepProps {
  onComplete: (dailyCustomers: number) => void;
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

interface SlowHourPickerProps {
  slowStart: number | null;
  slowEnd: number | null;
  openHour: number;
  closeHour: number;
  noSlow: boolean;
  onChangeStart: (h: number) => void;
  onChangeEnd: (h: number) => void;
  onToggleNoSlow: () => void;
}

function SlowHourPicker({
  slowStart,
  slowEnd,
  openHour,
  closeHour,
  noSlow,
  onChangeStart,
  onChangeEnd,
  onToggleNoSlow,
}: SlowHourPickerProps) {
  const resolvedStart = slowStart ?? openHour;
  const resolvedEnd = slowEnd ?? Math.min(closeHour, openHour + 2);

  return (
    <div className={styles.questionContainer} style={{ gap: 16 }}>
      <div className={styles.timePicker} style={{ opacity: noSlow ? 0.35 : 1, pointerEvents: noSlow ? 'none' : undefined }}>
        <span className={styles.timePickerLabel}>부터</span>
        <div className={styles.timePickerGroup}>
          <button
            className={styles.timeAdjBtn}
            onClick={() => onChangeStart(Math.max(openHour, resolvedStart - 1))}
            disabled={resolvedStart <= openHour}
            aria-label="한가한 시작 시간 줄이기"
          >−</button>
          <span className={styles.timeValue}>{resolvedStart}시</span>
          <button
            className={styles.timeAdjBtn}
            onClick={() => onChangeStart(Math.min(resolvedEnd - 1, resolvedStart + 1))}
            disabled={resolvedStart >= resolvedEnd - 1}
            aria-label="한가한 시작 시간 늘리기"
          >+</button>
        </div>
        <span className={styles.timePickerLabel} style={{ marginLeft: 16 }}>까지</span>
        <div className={styles.timePickerGroup}>
          <button
            className={styles.timeAdjBtn}
            onClick={() => onChangeEnd(Math.max(resolvedStart + 1, resolvedEnd - 1))}
            disabled={resolvedEnd <= resolvedStart + 1}
            aria-label="한가한 마감 시간 줄이기"
          >−</button>
          <span className={styles.timeValue}>{resolvedEnd}시</span>
          <button
            className={styles.timeAdjBtn}
            onClick={() => onChangeEnd(Math.min(closeHour, resolvedEnd + 1))}
            disabled={resolvedEnd >= closeHour}
            aria-label="한가한 마감 시간 늘리기"
          >+</button>
        </div>
      </div>
      <button
        className={`${styles.noneBtn} ${noSlow ? styles.noneBtnActive : ''}`}
        onClick={onToggleNoSlow}
        type="button"
      >
        없어요
      </button>
    </div>
  );
}

interface RateSliderProps {
  value: number;
  onChange: (v: number) => void;
  label: string;
}

function RateSlider({ value, onChange, label }: RateSliderProps) {
  return (
    <div className={styles.sliderWrap}>
      <div>
        <span className={styles.sliderValue}>{value}</span>
        <span className={styles.sliderUnit}>명/시간</span>
      </div>
      <input
        className={styles.sliderTrack}
        type="range"
        min={0}
        max={200}
        step={1}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        aria-label={label}
      />
    </div>
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
  const fmt = (days: DayKey[]) => days.map(d => d + '요일').join(', ');

  let breakdownLine: string | null = null;
  if (data.busyDays.length > 0 && data.normalDays.length > 0) {
    breakdownLine =
      `${fmt(data.busyDays)} 하루 약 ${data.busyDailyVisitors}명, ` +
      `${fmt(data.normalDays)} 하루 약 ${data.normalDailyVisitors}명`;
  } else if (data.busyDays.length > 0) {
    breakdownLine = `${fmt(data.busyDays)} 하루 약 ${data.busyDailyVisitors}명`;
  }

  return (
    <div className={styles.summaryScreen}>
      <div className={styles.summaryContent}>
        <span className={styles.summaryEmoji} aria-hidden="true">
          대단해요 {UI_ICONS.confetti}
        </span>
        <div className={styles.summaryTextBlock}>
          <p className={styles.summaryMessage}>
            {`일주일에 약 ${data.weeklyTotal}명이\n방문할 예정이에요!`}
          </p>
          {breakdownLine && (
            <p className={styles.summaryBreakdown}>{breakdownLine}</p>
          )}
        </div>
        <div className={styles.summaryBtnWrap}>
          <button className={styles.nextBtn} onClick={onNext} type="button">
            다음으로
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function VisitorEstimationStep({ onComplete }: VisitorEstimationStepProps) {
  // Q1 – Bug #2: store actual selected days instead of a count
  const [selectedDays, setSelectedDays] = useState<DayKey[]>(['월', '화', '수', '목', '금', '토']);
  // Q2
  const [openHour, setOpenHour] = useState<number>(10);
  const [closeHour, setCloseHour] = useState<number>(22);
  // Q3
  const [busyDays, setBusyDays] = useState<DayKey[]>([]);
  // Q4 – slow hours for busy days
  const [busySlowStart, setBusySlowStart] = useState<number | null>(null);
  const [busySlowEnd, setBusySlowEnd] = useState<number | null>(null);
  const [busyNoSlow, setBusyNoSlow] = useState<boolean>(false);
  // Q5 – slow rate for busy days
  const [busySlowRate, setBusySlowRate] = useState<number>(10);
  // Q6 – busy rate for busy days
  const [busyBusyRate, setBusyBusyRate] = useState<number>(30);
  // Q7 – slow hours for normal days
  const [normSlowStart, setNormSlowStart] = useState<number | null>(null);
  const [normSlowEnd, setNormSlowEnd] = useState<number | null>(null);
  const [normNoSlow, setNormNoSlow] = useState<boolean>(false);
  // Q8 – slow rate for normal days
  const [normSlowRate, setNormSlowRate] = useState<number>(5);
  // Q9 – busy rate for normal days
  const [normBusyRate, setNormBusyRate] = useState<number>(15);

  // Animation state: 'entering' | 'idle' | 'exiting'
  const [animState, setAnimState] = useState<'entering' | 'idle' | 'exiting'>('entering');
  const [currentQ, setCurrentQ] = useState<QuestionId>('q1-days');
  const [pendingQ, setPendingQ] = useState<QuestionId | null>(null);

  const totalHours = Math.max(0, closeHour - openHour);
  const operatingDays = selectedDays.length;

  // Days selected in Q1 are the only operating days.
  // Preserve order from ALL_DAYS for consistency.
  const activeDays = ALL_DAYS.filter(d => selectedDays.includes(d));
  // Bug #3: busyDays filtered to only those in activeDays
  const busyActiveDays = busyDays.filter(d => activeDays.includes(d));
  const normalActiveDays = activeDays.filter(d => !busyActiveDays.includes(d));

  // ─── Calculation helpers ──────────────────────────────────────────────────

  function calcDaily(
    noSlow: boolean,
    slowStartH: number | null,
    slowEndH: number | null,
    slowRate: number,
    busyRate: number,
  ): number {
    if (noSlow || slowStartH === null || slowEndH === null) {
      // All hours are "busy"
      return Math.round(totalHours * busyRate);
    }
    const resolvedStart = slowStartH ?? openHour;
    const resolvedEnd = slowEndH ?? Math.min(closeHour, openHour + 2);
    const slowHrs = Math.max(0, resolvedEnd - resolvedStart);
    const busyHrs = Math.max(0, totalHours - slowHrs);
    return Math.round(busyHrs * busyRate + slowHrs * slowRate);
  }

  // ─── Navigation ───────────────────────────────────────────────────────────

  const advanceTo = useCallback((next: QuestionId) => {
    setAnimState('exiting');
    setPendingQ(next);
  }, []);

  const goToNow = useCallback((next: QuestionId) => {
    setCurrentQ(next);
    setPendingQ(null);
    setAnimState('entering');
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

  // Bug #4: back navigation map
  function goBack(from: QuestionId) {
    const backMap: Partial<Record<QuestionId, QuestionId>> = {
      'q2-hours': 'q1-days',
      'q3-busy-days': 'q2-hours',
      'transition-busy': 'q3-busy-days',
      'q4-slow-hours-busy': 'transition-busy',
      'q5-slow-rate-busy': 'q4-slow-hours-busy',
      'q6-busy-rate-busy': busyNoSlow ? 'q4-slow-hours-busy' : 'q5-slow-rate-busy',
      'transition-normal': busyDays.length > 0 ? 'q6-busy-rate-busy' : 'q3-busy-days',
      'q7-slow-hours-normal': busyDays.length > 0 ? 'transition-normal' : 'q3-busy-days',
      'q8-slow-rate-normal': 'q7-slow-hours-normal',
      'q9-busy-rate-normal': normNoSlow ? 'q7-slow-hours-normal' : 'q8-slow-rate-normal',
      'summary': normalActiveDays.length > 0 ? 'q9-busy-rate-normal' : 'q6-busy-rate-busy',
    };
    const prev = backMap[from];
    if (prev) advanceTo(prev);
  }

  // ─── Q3: skip handler ─────────────────────────────────────────────────────

  function handleSkipBusy() {
    setBusyDays([]);
    advanceTo('transition-normal');
  }

  // ─── Final submit ─────────────────────────────────────────────────────────

  function handleFinish() {
    const busyDaily = calcDaily(busyNoSlow, busySlowStart, busySlowEnd, busySlowRate, busyBusyRate);
    const normDaily = calcDaily(normNoSlow, normSlowStart, normSlowEnd, normSlowRate, normBusyRate);
    const weeklyTotal = busyActiveDays.length * busyDaily + normalActiveDays.length * normDaily;
    // Convert weekly visitors to calendar-day average (weekly / 7),
    // then monthly logic multiplies by business operating days.
    const avgDaily = Math.round(weeklyTotal / 7);
    onComplete(avgDaily);
  }

  // ─── Summary data ─────────────────────────────────────────────────────────

  function getSummaryData(): SummaryData {
    const busyDaily = calcDaily(busyNoSlow, busySlowStart, busySlowEnd, busySlowRate, busyBusyRate);
    const normDaily = calcDaily(normNoSlow, normSlowStart, normSlowEnd, normSlowRate, normBusyRate);
    const weeklyTotal = busyActiveDays.length * busyDaily + normalActiveDays.length * normDaily;
    const avgDaily = Math.round(weeklyTotal / 7);
    return {
      busyDays: busyActiveDays,
      normalDays: normalActiveDays,
      busyDailyVisitors: busyDaily,
      normalDailyVisitors: normDaily,
      avgDaily,
      weeklyTotal,
    };
  }

  // ─── Determine next question in flow ──────────────────────────────────────

  function handleQ1Next() {
    advanceTo('q2-hours');
  }

  function handleQ2Next() {
    advanceTo('q3-busy-days');
  }

  function handleQ3Next() {
    if (busyDays.length > 0) {
      advanceTo('transition-busy');
    } else {
      advanceTo('transition-normal');
    }
  }

  function handleQ4Next() {
    if (busyNoSlow) {
      advanceTo('q6-busy-rate-busy');
    } else {
      advanceTo('q5-slow-rate-busy');
    }
  }

  function handleQ5Next() {
    advanceTo('q6-busy-rate-busy');
  }

  function handleQ6Next() {
    if (normalActiveDays.length > 0) {
      advanceTo('transition-normal');
    } else {
      advanceTo('summary');
    }
  }

  function handleQ7Next() {
    if (normNoSlow) {
      advanceTo('q9-busy-rate-normal');
    } else {
      advanceTo('q8-slow-rate-normal');
    }
  }

  function handleQ8Next() {
    advanceTo('q9-busy-rate-normal');
  }

  function handleQ9Next() {
    advanceTo('summary');
  }

  // ─── Animation class ──────────────────────────────────────────────────────

  const animClass =
    animState === 'entering' ? styles.questionEnter
    : animState === 'exiting' ? styles.questionExit
    : '';

  // ─── Render ───────────────────────────────────────────────────────────────

  function renderQuestion() {
    // Bug #5: helper to render day-category headers
    function DayHeader({ category, days }: { category: string; days: DayKey[] }) {
      const dayStr = days.map(d => d).join(', ');
      return (
        <h2 className={styles.questionLabel}>
          <strong>{category}</strong>{' '}
          <span style={{ fontWeight: 'normal' }}>({dayStr})</span>
        </h2>
      );
    }

    // Back button helper (Bug #4)
    function BackButton({ q }: { q: QuestionId }) {
      return (
        <button className={styles.skipBtn} onClick={() => goBack(q)} type="button">
          이전
        </button>
      );
    }

    switch (currentQ) {
      // ── Q1: operating days ───────────────────────────────────────────────
      // Bug #2: day toggles instead of number buttons
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
                          // Also remove from busyDays if day is deselected
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
                onClick={handleQ1Next}
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
              <h2 className={styles.questionLabel}>문을 여는 날에는 몇 시부터 몇 시까지 영업하실 건가요?</h2>
              <TimePair
                openHour={openHour}
                closeHour={closeHour}
                onChangeOpen={h => setOpenHour(Math.min(h, closeHour - 1))}
                onChangeClose={h => setCloseHour(Math.max(h, openHour + 1))}
              />
              <button className={styles.nextBtn} onClick={handleQ2Next} type="button">
                다음
              </button>
              <BackButton q="q2-hours" />
            </div>
          </div>
        );

      // ── Q3: busy days selection ──────────────────────────────────────────
      // Bug #3: only show days from selectedDays (Q1)
      case 'q3-busy-days': {
        const allBusySelected = busyDays.filter(d => activeDays.includes(d)).length === activeDays.length;
        return (
          <div className={styles.step}>
            <div
              key="q3"
              className={`${styles.questionContainer} ${animClass}`}
              onAnimationEnd={animState === 'exiting' ? handleExitDone : handleEnterDone}
            >
              <h2 className={styles.questionLabel}>장사가 잘 되는 요일이 정해져 있나요?</h2>
              <div className={styles.dayToggleRow}>
                {activeDays.map(day => {
                  const isActive = busyDays.includes(day);
                  const allOthersSelected = !isActive && allBusySelected;
                  return (
                    <button
                      key={day}
                      className={`${styles.dayToggle} ${isActive ? styles.dayToggleActive : ''}`}
                      onClick={() => {
                        if (allOthersSelected) return;
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
              <p className={styles.dayToggleHint}>
                모든 요일이 비슷하다면 그냥 건너뛰기를 눌러주세요.
              </p>
              <button className={styles.nextBtn} onClick={handleQ3Next} type="button">
                다음
              </button>
              <button className={styles.skipBtn} onClick={handleSkipBusy} type="button">
                건너뛰기
              </button>
              <BackButton q="q3-busy-days" />
            </div>
          </div>
        );
      }

      // ── Transition: busy days ────────────────────────────────────────────
      case 'transition-busy':
        return (
          <TossTransition
            emoji="🔥"
            message="장사가 잘 되는 날"
            buttonText="시작하기"
            onComplete={() => goToNow('q4-slow-hours-busy')}
          />
        );

      // ── Q4: slow hours (busy days) ───────────────────────────────────────
      case 'q4-slow-hours-busy':
        return (
          <div className={styles.step}>
            <div
              key="q4"
              className={`${styles.questionContainer} ${animClass}`}
              onAnimationEnd={animState === 'exiting' ? handleExitDone : handleEnterDone}
            >
              <DayHeader category="장사가 잘 되는 날" days={busyActiveDays} />
              <p className={styles.questionSub}>한가로운 시간은 몇 시부터 몇 시인가요? (없다고 해주셔도 돼요)</p>
              <SlowHourPicker
                slowStart={busySlowStart}
                slowEnd={busySlowEnd}
                openHour={openHour}
                closeHour={closeHour}
                noSlow={busyNoSlow}
                onChangeStart={h => { setBusySlowStart(h); setBusyNoSlow(false); }}
                onChangeEnd={h => { setBusySlowEnd(h); setBusyNoSlow(false); }}
                onToggleNoSlow={() => setBusyNoSlow(p => !p)}
              />
              <button className={styles.nextBtn} onClick={handleQ4Next} type="button">
                다음
              </button>
              <BackButton q="q4-slow-hours-busy" />
            </div>
          </div>
        );

      // ── Q5: slow-hour rate (busy days) ───────────────────────────────────
      // Bug #6: "한가할 때" → "한가한 시간대"
      case 'q5-slow-rate-busy':
        return (
          <div className={styles.step}>
            <div
              key="q5"
              className={`${styles.questionContainer} ${animClass}`}
              onAnimationEnd={animState === 'exiting' ? handleExitDone : handleEnterDone}
            >
              <DayHeader category="장사가 잘 되는 날" days={busyActiveDays} />
              <p className={styles.questionSub}>한가한 시간대 시간당 몇 명이 방문할 것 같으세요?</p>
              <p className={styles.dayToggleHint} style={{ fontSize: '13px', color: '#999' }}>
                테이블 수, 응대 시간, 업종 크기 등을 고려해서 결정해 주세요.
              </p>
              <RateSlider
                value={busySlowRate}
                onChange={setBusySlowRate}
                label="한가한 시간대 방문객 (바쁜 날)"
              />
              <button className={styles.nextBtn} onClick={handleQ5Next} type="button">
                다음
              </button>
              <BackButton q="q5-slow-rate-busy" />
            </div>
          </div>
        );

      // ── Q6: busy-hour rate (busy days) ───────────────────────────────────
      // Bug #6: "바쁠 때" → "바쁜 시간대"
      case 'q6-busy-rate-busy':
        return (
          <div className={styles.step}>
            <div
              key="q6"
              className={`${styles.questionContainer} ${animClass}`}
              onAnimationEnd={animState === 'exiting' ? handleExitDone : handleEnterDone}
            >
              <DayHeader category="장사가 잘 되는 날" days={busyActiveDays} />
              <p className={styles.questionSub}>바쁜 시간대 시간당 몇 명이 방문할 것 같으세요?</p>
              <p className={styles.dayToggleHint} style={{ fontSize: '13px', color: '#999' }}>
                테이블 수, 응대 시간, 업종 크기 등을 고려해서 결정해 주세요.
              </p>
              <RateSlider
                value={busyBusyRate}
                onChange={setBusyBusyRate}
                label="바쁜 시간대 방문객 (바쁜 날)"
              />
              <button className={styles.nextBtn} onClick={handleQ6Next} type="button">
                다음
              </button>
              <BackButton q="q6-busy-rate-busy" />
            </div>
          </div>
        );

      // ── Transition: normal days ──────────────────────────────────────────
      case 'transition-normal':
        return (
          <TossTransition
            emoji="☕"
            message="일반적인 날"
            buttonText="시작하기"
            onComplete={() => goToNow('q7-slow-hours-normal')}
          />
        );

      // ── Q7: slow hours (normal days) ─────────────────────────────────────
      case 'q7-slow-hours-normal':
        return (
          <div className={styles.step}>
            <div
              key="q7"
              className={`${styles.questionContainer} ${animClass}`}
              onAnimationEnd={animState === 'exiting' ? handleExitDone : handleEnterDone}
            >
              {normalActiveDays.length > 0
                ? <DayHeader category="일반적인 날" days={normalActiveDays} />
                : <h2 className={styles.questionLabel}><strong>일반적인 날</strong></h2>
              }
              <p className={styles.questionSub}>한가로운 시간은 몇 시부터 몇 시인가요? (없다고 해주셔도 돼요)</p>
              <SlowHourPicker
                slowStart={normSlowStart}
                slowEnd={normSlowEnd}
                openHour={openHour}
                closeHour={closeHour}
                noSlow={normNoSlow}
                onChangeStart={h => { setNormSlowStart(h); setNormNoSlow(false); }}
                onChangeEnd={h => { setNormSlowEnd(h); setNormNoSlow(false); }}
                onToggleNoSlow={() => setNormNoSlow(p => !p)}
              />
              <button className={styles.nextBtn} onClick={handleQ7Next} type="button">
                다음
              </button>
              <BackButton q="q7-slow-hours-normal" />
            </div>
          </div>
        );

      // ── Q8: slow-hour rate (normal days) ─────────────────────────────────
      // Bug #6: "한가할 때" → "한가한 시간대"
      case 'q8-slow-rate-normal':
        return (
          <div className={styles.step}>
            <div
              key="q8"
              className={`${styles.questionContainer} ${animClass}`}
              onAnimationEnd={animState === 'exiting' ? handleExitDone : handleEnterDone}
            >
              {normalActiveDays.length > 0
                ? <DayHeader category="일반적인 날" days={normalActiveDays} />
                : <h2 className={styles.questionLabel}><strong>일반적인 날</strong></h2>
              }
              <p className={styles.questionSub}>한가한 시간대 시간당 몇 명이 방문할 것 같으세요?</p>
              <p className={styles.dayToggleHint} style={{ fontSize: '13px', color: '#999' }}>
                테이블 수, 응대 시간, 업종 크기 등을 고려해서 결정해 주세요.
              </p>
              <RateSlider
                value={normSlowRate}
                onChange={setNormSlowRate}
                label="한가한 시간대 방문객 (일반 날)"
              />
              <button className={styles.nextBtn} onClick={handleQ8Next} type="button">
                다음
              </button>
              <BackButton q="q8-slow-rate-normal" />
            </div>
          </div>
        );

      // ── Q9: busy-hour rate (normal days) ─────────────────────────────────
      // Bug #6: "바쁠 때" → "바쁜 시간대"
      case 'q9-busy-rate-normal':
        return (
          <div className={styles.step}>
            <div
              key="q9"
              className={`${styles.questionContainer} ${animClass}`}
              onAnimationEnd={animState === 'exiting' ? handleExitDone : handleEnterDone}
            >
              {normalActiveDays.length > 0
                ? <DayHeader category="일반적인 날" days={normalActiveDays} />
                : <h2 className={styles.questionLabel}><strong>일반적인 날</strong></h2>
              }
              <p className={styles.questionSub}>바쁜 시간대 시간당 몇 명이 방문할 것 같으세요?</p>
              <p className={styles.dayToggleHint} style={{ fontSize: '13px', color: '#999' }}>
                테이블 수, 응대 시간, 업종 크기 등을 고려해서 결정해 주세요.
              </p>
              <RateSlider
                value={normBusyRate}
                onChange={setNormBusyRate}
                label="바쁜 시간대 방문객 (일반 날)"
              />
              <button className={styles.nextBtn} onClick={handleQ9Next} type="button">
                다음
              </button>
              <BackButton q="q9-busy-rate-normal" />
            </div>
          </div>
        );

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
