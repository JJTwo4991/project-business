import type { Meta, StoryObj } from '@storybook/react';

// Components
import { IndustrySelectStep } from '../pages/WizardSteps/IndustrySelectStep';
import { ScaleSelectStep } from '../pages/WizardSteps/ScaleSelectStep';
import { InvestmentBreakdownStep } from '../pages/WizardSteps/InvestmentBreakdownStep';
import { RegionStep } from '../pages/WizardSteps/RegionStep';
import { InvestmentStep, LoanStep } from '../pages/WizardSteps/InvestmentStep';
import { VisitorEstimationStep } from '../pages/WizardSteps/VisitorEstimationStep';
import { TicketStep, LaborStep, RentStep, MiscStep } from '../pages/WizardSteps/OperatingParamsSteps';
import { ConfirmStep } from '../pages/WizardSteps/ConfirmStep';
import { ResultPage } from '../pages/ResultPage/ResultPage';
import { TossTransition } from '../components/TossTransition/TossTransition';

// Mock Data & Utils
import { BUSINESS_TYPES } from '../data/businessTypes';
import type { SimulatorInputs, SimulationResult } from '../types';
import { runSimulation } from '../lib/calculator';
import { UI_ICONS } from '../assets/icons';

const mockBusinessType = BUSINESS_TYPES[0]; // 치킨전문점

const mockInputs: SimulatorInputs = {
  business_type: mockBusinessType,
  scale: 'medium',
  region: { sido: '서울', sangkwon: '강남', rent_per_sqm: 63700 },
  capital: {
    investment_breakdown: [
      { category: 'franchise', label: '가맹비', amount: 5000000, editable: true },
      { category: 'interior', label: '인테리어', amount: 30000000, editable: true },
    ],
    initial_investment: 35000000,
    equity: 20000000,
    loan_term_years: 5,
    interest_rate: 0.05,
  },
  daily_customers_override: 50,
  ticket_price_override: 20000,
  labor_headcount: 2,
  rent_monthly: 3000000,
  material_cost_ratio_override: 0.4,
  selected_brand: undefined,
};

const mockResult: SimulationResult = runSimulation(mockInputs);

const meta = {
  title: 'App/Screens',
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div style={{ 
        width: '375px', 
        height: '812px', 
        border: '1px solid #ccc', 
        margin: '20px auto', 
        overflowY: 'auto', 
        overflowX: 'hidden',
        borderRadius: '24px', 
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        backgroundColor: '#F4F4F4', // var(--color-bg)
        position: 'relative'
      }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta;

export default meta;

// 1. 업종 선택
export const Step01_IndustrySelect: StoryObj = {
  render: () => (
    <IndustrySelectStep businessTypes={BUSINESS_TYPES} onSelect={() => alert('Selected!')} />
  ),
};

// 2. 지역 선택
export const Step02_RegionSelect: StoryObj = {
  render: () => (
    <RegionStep
      sidos={['서울', '경기', '부산']}
      getRegions={() => ['도심', '강남', '영등포신촌']}
      getSangkwons={() => ['명동', '광화문', '시청']}
      getRent={() => ({ id: 1, sido: '서울', region: '도심', sangkwon: '명동', rent_per_sqm: 144200, data_quarter: '2025Q4' })}
      scale="medium"
      businessTypeId={mockBusinessType.id}
      onSelect={() => alert('Region selected!')}
      onNext={() => alert('Next!')}
    />
  ),
};

// 3. 규모 선택
export const Step03_ScaleSelect: StoryObj = {
  render: () => (
    <ScaleSelectStep
      businessType={mockBusinessType}
      selected="medium"
      onSelect={() => {}}
      onNext={() => alert('Next!')}
    />
  ),
};

// 4. 초기투자 항목 분해
export const Step04_InvestmentBreakdown: StoryObj = {
  render: () => (
    <InvestmentBreakdownStep
      businessTypeId={mockBusinessType.id}
      scale="medium"
      breakdown={undefined}
      onChange={() => {}}
      onNext={() => alert('Next!')}
    />
  ),
};

// 5. 투자금/대출 설정 (Investment)
export const Step05_Investment: StoryObj = {
  render: () => (
    <InvestmentStep
      businessType={mockBusinessType}
      scale="medium"
      capital={mockInputs.capital}
      onChange={() => {}}
      onNext={() => alert('Next!')}
    />
  ),
};

// 6. 대출 설정 (Loan)
export const Step06_Loan: StoryObj = {
  render: () => (
    <LoanStep
      businessTypeId={mockBusinessType.id}
      scale="medium"
      capital={mockInputs.capital}
      onChange={() => {}}
      onNext={() => alert('Next!')}
    />
  ),
};

// 7. 전환 화면 (운영 파라미터로)
export const Step07_TransitionOperating: StoryObj = {
  render: () => (
    <TossTransition
      iconSrc={UI_ICONS.clap}
      message="수고하셨어요! 이제 장사가 얼마나 잘 될지 예상해볼까요?"
      buttonText="준비됐어요"
      onComplete={() => alert('Next!')}
    />
  ),
};

// 8. 방문객 추정
export const Step08_VisitorEstimation: StoryObj = {
  render: () => (
    <VisitorEstimationStep onComplete={(v) => alert(`Estimated: ${v}`)} />
  ),
};

// 9. 객단가 설정
export const Step09_TicketPrice: StoryObj = {
  render: () => (
    <TicketStep inputs={mockInputs} onOverride={() => {}} onNext={() => alert('Next!')} />
  ),
};

// 10. 인건비 설정
export const Step10_LaborCost: StoryObj = {
  render: () => (
    <LaborStep inputs={mockInputs} onOverride={() => {}} onNext={() => alert('Next!')} />
  ),
};

// 11. 임대료 설정
export const Step11_RentCost: StoryObj = {
  render: () => (
    <RentStep inputs={mockInputs} onOverride={() => {}} onNext={() => alert('Next!')} />
  ),
};

// 12. 입력 확인
export const Step12_Confirm: StoryObj = {
  render: () => (
    <ConfirmStep inputs={mockInputs} onCalculate={() => alert('Calculate!')} onGoTo={() => {}} />
  ),
};

// 13. 기타비용 설정
export const Step13_MiscCost: StoryObj = {
  render: () => (
    <MiscStep inputs={mockInputs} onOverride={() => {}} onNext={() => alert('Next!')} />
  ),
};

// 14. 결과 (일 손익)
export const Result_Daily: StoryObj = {
  render: () => (
    <ResultPage
      result={mockResult}
      view="result-daily"
      onBack={() => alert('Back')}
      onNext={() => alert('Next')}
      onGoTo={() => {}}
    />
  ),
};

// 15. 결과 (월 손익)
export const Result_Monthly: StoryObj = {
  render: () => (
    <ResultPage
      result={mockResult}
      view="result-monthly"
      onBack={() => alert('Back')}
      onNext={() => alert('Next')}
      onGoTo={() => {}}
    />
  ),
};

// 16. 결과 (투자회수)
export const Result_Payback: StoryObj = {
  render: () => (
    <ResultPage
      result={mockResult}
      view="result-payback"
      onBack={() => alert('Back')}
      onNext={() => alert('Next')}
      onGoTo={() => {}}
    />
  ),
};

// 17. 결과 (DCF 가치평가)
export const Result_DCF: StoryObj = {
  render: () => (
    <ResultPage
      result={mockResult}
      view="result-dcf"
      onBack={() => alert('Back')}
      onNext={() => alert('Next')}
      onGoTo={() => {}}
    />
  ),
};
