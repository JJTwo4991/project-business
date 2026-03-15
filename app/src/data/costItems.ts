import type { CostItem, BusinessScale, InvestmentItem } from '../types';

export const COST_ITEMS: CostItem[] = [
  {id:1,business_type_id:1,cost_category:"rent",cost_name:"임대료",amount_monthly_min:800000,amount_monthly_max:2500000,is_initial_cost:false,note:"상권별 편차 큼"},
  {id:2,business_type_id:1,cost_category:"labor",cost_name:"직원 인건비",amount_monthly_min:2800000,amount_monthly_max:2800000,is_initial_cost:false,note:"1인 기준"},
  {id:3,business_type_id:1,cost_category:"material",cost_name:"식재료비",amount_monthly_min:3800000,amount_monthly_max:13300000,is_initial_cost:false,note:"매출의 38%"},
  {id:4,business_type_id:1,cost_category:"utilities",cost_name:"공과금",amount_monthly_min:200000,amount_monthly_max:500000,is_initial_cost:false,note:"전기/가스/수도"},
  {id:5,business_type_id:1,cost_category:"equipment",cost_name:"프랜차이즈 가맹비",amount_monthly_min:10000000,amount_monthly_max:30000000,is_initial_cost:true,note:"초기 1회"},
  {id:6,business_type_id:1,cost_category:"equipment",cost_name:"인테리어/설비",amount_monthly_min:15000000,amount_monthly_max:50000000,is_initial_cost:true,note:"초기 1회"},
  {id:7,business_type_id:1,cost_category:"marketing",cost_name:"배달앱 수수료",amount_monthly_min:300000,amount_monthly_max:1500000,is_initial_cost:false,note:"매출의 약 10%"},
  {id:8,business_type_id:1,cost_category:"other",cost_name:"기타 고정비",amount_monthly_min:350000,amount_monthly_max:350000,is_initial_cost:false,note:"소모품/보험 등"},
  {id:9,business_type_id:2,cost_category:"rent",cost_name:"임대료",amount_monthly_min:1000000,amount_monthly_max:3500000,is_initial_cost:false,note:"역세권 기준"},
  {id:10,business_type_id:2,cost_category:"labor",cost_name:"직원 인건비",amount_monthly_min:2500000,amount_monthly_max:2500000,is_initial_cost:false,note:"1인 기준"},
  {id:11,business_type_id:2,cost_category:"material",cost_name:"원두/부자재",amount_monthly_min:2000000,amount_monthly_max:10000000,is_initial_cost:false,note:"매출의 25%"},
  {id:12,business_type_id:2,cost_category:"utilities",cost_name:"공과금",amount_monthly_min:200000,amount_monthly_max:400000,is_initial_cost:false,note:null},
  {id:13,business_type_id:2,cost_category:"equipment",cost_name:"커피머신/설비",amount_monthly_min:10000000,amount_monthly_max:50000000,is_initial_cost:true,note:"에스프레소 머신 등"},
  {id:14,business_type_id:2,cost_category:"equipment",cost_name:"인테리어",amount_monthly_min:15000000,amount_monthly_max:80000000,is_initial_cost:true,note:"평당 200~400만"},
  {id:15,business_type_id:2,cost_category:"other",cost_name:"기타 고정비",amount_monthly_min:400000,amount_monthly_max:400000,is_initial_cost:false,note:null},
  {id:16,business_type_id:3,cost_category:"rent",cost_name:"임대료",amount_monthly_min:1000000,amount_monthly_max:3000000,is_initial_cost:false,note:null},
  {id:17,business_type_id:3,cost_category:"labor",cost_name:"직원 인건비",amount_monthly_min:2400000,amount_monthly_max:2400000,is_initial_cost:false,note:"1인 기준"},
  {id:18,business_type_id:3,cost_category:"material",cost_name:"상품매입비",amount_monthly_min:21600000,amount_monthly_max:57600000,is_initial_cost:false,note:"매출의 72%"},
  {id:19,business_type_id:3,cost_category:"utilities",cost_name:"공과금",amount_monthly_min:300000,amount_monthly_max:600000,is_initial_cost:false,note:"24시간 운영"},
  {id:20,business_type_id:3,cost_category:"equipment",cost_name:"가맹보증금",amount_monthly_min:20000000,amount_monthly_max:50000000,is_initial_cost:true,note:null},
  {id:21,business_type_id:3,cost_category:"equipment",cost_name:"인테리어/설비",amount_monthly_min:20000000,amount_monthly_max:80000000,is_initial_cost:true,note:null},
  {id:22,business_type_id:3,cost_category:"other",cost_name:"기타 고정비",amount_monthly_min:200000,amount_monthly_max:200000,is_initial_cost:false,note:null},
  {id:23,business_type_id:4,cost_category:"rent",cost_name:"임대료",amount_monthly_min:600000,amount_monthly_max:2000000,is_initial_cost:false,note:null},
  {id:24,business_type_id:4,cost_category:"labor",cost_name:"디자이너 인건비",amount_monthly_min:2800000,amount_monthly_max:2800000,is_initial_cost:false,note:"1인 기준"},
  {id:25,business_type_id:4,cost_category:"material",cost_name:"미용재료비",amount_monthly_min:500000,amount_monthly_max:2500000,is_initial_cost:false,note:"매출의 10%"},
  {id:26,business_type_id:4,cost_category:"utilities",cost_name:"공과금",amount_monthly_min:150000,amount_monthly_max:300000,is_initial_cost:false,note:null},
  {id:27,business_type_id:4,cost_category:"equipment",cost_name:"인테리어/의자/도구",amount_monthly_min:10000000,amount_monthly_max:50000000,is_initial_cost:true,note:null},
  {id:28,business_type_id:4,cost_category:"other",cost_name:"기타 고정비",amount_monthly_min:300000,amount_monthly_max:300000,is_initial_cost:false,note:null},
  {id:29,business_type_id:5,cost_category:"rent",cost_name:"임대료",amount_monthly_min:500000,amount_monthly_max:1500000,is_initial_cost:false,note:null},
  {id:30,business_type_id:5,cost_category:"labor",cost_name:"직원 인건비",amount_monthly_min:2500000,amount_monthly_max:2500000,is_initial_cost:false,note:"1인 기준"},
  {id:31,business_type_id:5,cost_category:"material",cost_name:"식재료비",amount_monthly_min:2800000,amount_monthly_max:8750000,is_initial_cost:false,note:"매출의 35%"},
  {id:32,business_type_id:5,cost_category:"utilities",cost_name:"공과금",amount_monthly_min:150000,amount_monthly_max:350000,is_initial_cost:false,note:null},
  {id:33,business_type_id:5,cost_category:"equipment",cost_name:"인테리어/설비",amount_monthly_min:8000000,amount_monthly_max:30000000,is_initial_cost:true,note:null},
  {id:34,business_type_id:5,cost_category:"other",cost_name:"기타 고정비",amount_monthly_min:250000,amount_monthly_max:250000,is_initial_cost:false,note:null},
  {id:35,business_type_id:6,cost_category:"rent",cost_name:"임대료",amount_monthly_min:1000000,amount_monthly_max:3000000,is_initial_cost:false,note:null},
  {id:36,business_type_id:6,cost_category:"labor",cost_name:"직원 인건비",amount_monthly_min:2800000,amount_monthly_max:2800000,is_initial_cost:false,note:"1인 기준"},
  {id:37,business_type_id:6,cost_category:"material",cost_name:"고기/식재료",amount_monthly_min:6300000,amount_monthly_max:16800000,is_initial_cost:false,note:"매출의 42%"},
  {id:38,business_type_id:6,cost_category:"utilities",cost_name:"공과금",amount_monthly_min:250000,amount_monthly_max:600000,is_initial_cost:false,note:"환기시설 전기료"},
  {id:39,business_type_id:6,cost_category:"equipment",cost_name:"인테리어/설비",amount_monthly_min:25000000,amount_monthly_max:70000000,is_initial_cost:true,note:"좌석/환풍기 등"},
  {id:40,business_type_id:6,cost_category:"other",cost_name:"기타 고정비",amount_monthly_min:400000,amount_monthly_max:400000,is_initial_cost:false,note:null},
  {id:41,business_type_id:7,cost_category:"rent",cost_name:"임대료",amount_monthly_min:500000,amount_monthly_max:1500000,is_initial_cost:false,note:null},
  {id:42,business_type_id:7,cost_category:"labor",cost_name:"직원 인건비",amount_monthly_min:2500000,amount_monthly_max:2500000,is_initial_cost:false,note:"1인 기준"},
  {id:43,business_type_id:7,cost_category:"material",cost_name:"세제/용제",amount_monthly_min:750000,amount_monthly_max:3000000,is_initial_cost:false,note:"매출의 15%"},
  {id:44,business_type_id:7,cost_category:"utilities",cost_name:"공과금",amount_monthly_min:200000,amount_monthly_max:400000,is_initial_cost:false,note:"수도/전기"},
  {id:45,business_type_id:7,cost_category:"equipment",cost_name:"세탁장비",amount_monthly_min:15000000,amount_monthly_max:50000000,is_initial_cost:true,note:"드라이/워시 기기"},
  {id:46,business_type_id:7,cost_category:"other",cost_name:"기타 고정비",amount_monthly_min:200000,amount_monthly_max:200000,is_initial_cost:false,note:null},
  {id:47,business_type_id:8,cost_category:"rent",cost_name:"임대료",amount_monthly_min:800000,amount_monthly_max:2500000,is_initial_cost:false,note:null},
  {id:48,business_type_id:8,cost_category:"labor",cost_name:"직원 인건비",amount_monthly_min:2700000,amount_monthly_max:2700000,is_initial_cost:false,note:"1인 기준"},
  {id:49,business_type_id:8,cost_category:"material",cost_name:"식재료비",amount_monthly_min:3500000,amount_monthly_max:10500000,is_initial_cost:false,note:"매출의 35%"},
  {id:50,business_type_id:8,cost_category:"utilities",cost_name:"공과금",amount_monthly_min:200000,amount_monthly_max:450000,is_initial_cost:false,note:null},
  {id:51,business_type_id:8,cost_category:"equipment",cost_name:"오븐/설비",amount_monthly_min:15000000,amount_monthly_max:50000000,is_initial_cost:true,note:null},
  {id:52,business_type_id:8,cost_category:"marketing",cost_name:"배달앱 수수료",amount_monthly_min:300000,amount_monthly_max:1200000,is_initial_cost:false,note:null},
  {id:53,business_type_id:8,cost_category:"other",cost_name:"기타 고정비",amount_monthly_min:350000,amount_monthly_max:350000,is_initial_cost:false,note:null},
  {id:54,business_type_id:9,cost_category:"rent",cost_name:"임대료",amount_monthly_min:1000000,amount_monthly_max:3000000,is_initial_cost:false,note:null},
  {id:55,business_type_id:9,cost_category:"labor",cost_name:"제빵사 인건비",amount_monthly_min:2600000,amount_monthly_max:2600000,is_initial_cost:false,note:"1인 기준"},
  {id:56,business_type_id:9,cost_category:"material",cost_name:"밀가루/부자재",amount_monthly_min:3000000,amount_monthly_max:12000000,is_initial_cost:false,note:"매출의 30%"},
  {id:57,business_type_id:9,cost_category:"utilities",cost_name:"공과금",amount_monthly_min:250000,amount_monthly_max:500000,is_initial_cost:false,note:"오븐 전기료"},
  {id:58,business_type_id:9,cost_category:"equipment",cost_name:"오븐/설비/인테리어",amount_monthly_min:20000000,amount_monthly_max:80000000,is_initial_cost:true,note:null},
  {id:59,business_type_id:9,cost_category:"other",cost_name:"기타 고정비",amount_monthly_min:400000,amount_monthly_max:400000,is_initial_cost:false,note:null},
  {id:66,business_type_id:11,cost_category:"rent",cost_name:"임대료",amount_monthly_min:400000,amount_monthly_max:1500000,is_initial_cost:false,note:null},
  {id:67,business_type_id:11,cost_category:"labor",cost_name:"네일리스트 인건비",amount_monthly_min:2600000,amount_monthly_max:2600000,is_initial_cost:false,note:"1인 기준"},
  {id:68,business_type_id:11,cost_category:"material",cost_name:"재료비",amount_monthly_min:320000,amount_monthly_max:1200000,is_initial_cost:false,note:"매출의 8%"},
  {id:69,business_type_id:11,cost_category:"utilities",cost_name:"공과금",amount_monthly_min:100000,amount_monthly_max:200000,is_initial_cost:false,note:null},
  {id:70,business_type_id:11,cost_category:"equipment",cost_name:"인테리어/장비",amount_monthly_min:5000000,amount_monthly_max:25000000,is_initial_cost:true,note:null},
  {id:71,business_type_id:11,cost_category:"other",cost_name:"기타 고정비",amount_monthly_min:200000,amount_monthly_max:200000,is_initial_cost:false,note:null},
  {id:78,business_type_id:13,cost_category:"rent",cost_name:"임대료",amount_monthly_min:500000,amount_monthly_max:1500000,is_initial_cost:false,note:null},
  {id:79,business_type_id:13,cost_category:"labor",cost_name:"직원 인건비",amount_monthly_min:2500000,amount_monthly_max:2500000,is_initial_cost:false,note:"1인 기준"},
  {id:80,business_type_id:13,cost_category:"material",cost_name:"식재료비",amount_monthly_min:3600000,amount_monthly_max:11250000,is_initial_cost:false,note:"매출의 45%"},
  {id:81,business_type_id:13,cost_category:"utilities",cost_name:"공과금",amount_monthly_min:150000,amount_monthly_max:350000,is_initial_cost:false,note:null},
  {id:82,business_type_id:13,cost_category:"equipment",cost_name:"주방설비/인테리어",amount_monthly_min:8000000,amount_monthly_max:30000000,is_initial_cost:true,note:null},
  {id:83,business_type_id:13,cost_category:"other",cost_name:"기타 고정비",amount_monthly_min:250000,amount_monthly_max:250000,is_initial_cost:false,note:null},
  {id:84,business_type_id:14,cost_category:"rent",cost_name:"임대료",amount_monthly_min:500000,amount_monthly_max:1500000,is_initial_cost:false,note:null},
  {id:85,business_type_id:14,cost_category:"material",cost_name:"아이스크림 매입비",amount_monthly_min:2750000,amount_monthly_max:11000000,is_initial_cost:false,note:"매출의 55%"},
  {id:86,business_type_id:14,cost_category:"utilities",cost_name:"공과금/냉동전기",amount_monthly_min:200000,amount_monthly_max:500000,is_initial_cost:false,note:"냉동고 전기료"},
  {id:87,business_type_id:14,cost_category:"equipment",cost_name:"냉동고/인테리어",amount_monthly_min:10000000,amount_monthly_max:35000000,is_initial_cost:true,note:null},
  {id:88,business_type_id:14,cost_category:"equipment",cost_name:"무인시스템(키오스크)",amount_monthly_min:3000000,amount_monthly_max:10000000,is_initial_cost:true,note:null},
  {id:89,business_type_id:14,cost_category:"other",cost_name:"기타 고정비",amount_monthly_min:300000,amount_monthly_max:300000,is_initial_cost:false,note:"CCTV/보안"},
  {id:90,business_type_id:15,cost_category:"rent",cost_name:"임대료",amount_monthly_min:800000,amount_monthly_max:2500000,is_initial_cost:false,note:"상권별 편차 큼"},
  {id:91,business_type_id:15,cost_category:"labor",cost_name:"직원 인건비",amount_monthly_min:2200000,amount_monthly_max:2200000,is_initial_cost:false,note:"1인 기준"},
  {id:92,business_type_id:15,cost_category:"material",cost_name:"식재료비",amount_monthly_min:1500000,amount_monthly_max:8000000,is_initial_cost:false,note:"매출의 35%"},
  {id:93,business_type_id:15,cost_category:"utilities",cost_name:"공과금",amount_monthly_min:200000,amount_monthly_max:500000,is_initial_cost:false,note:"전기/가스/수도"},
  {id:94,business_type_id:15,cost_category:"material",cost_name:"주류비",amount_monthly_min:1000000,amount_monthly_max:5000000,is_initial_cost:false,note:"주류 매입비"},
  {id:95,business_type_id:15,cost_category:"marketing",cost_name:"배달수수료",amount_monthly_min:200000,amount_monthly_max:1000000,is_initial_cost:false,note:"배달앱 이용 시"},
  {id:96,business_type_id:15,cost_category:"other",cost_name:"기타 고정비",amount_monthly_min:800000,amount_monthly_max:800000,is_initial_cost:false,note:"소모품/보험 등"},
  {id:97,business_type_id:15,cost_category:"equipment",cost_name:"인테리어/설비",amount_monthly_min:15000000,amount_monthly_max:70000000,is_initial_cost:true,note:"냉장고/주방설비 등"},
  {id:98,business_type_id:16,cost_category:"rent",cost_name:"임대료",amount_monthly_min:400000,amount_monthly_max:1500000,is_initial_cost:false,note:"소형 점포 기준"},
  {id:99,business_type_id:16,cost_category:"material",cost_name:"원두/재료비",amount_monthly_min:300000,amount_monthly_max:2000000,is_initial_cost:false,note:"매출의 25%"},
  {id:100,business_type_id:16,cost_category:"utilities",cost_name:"공과금",amount_monthly_min:150000,amount_monthly_max:400000,is_initial_cost:false,note:"커피머신 전기료"},
  {id:101,business_type_id:16,cost_category:"other",cost_name:"기기유지보수",amount_monthly_min:100000,amount_monthly_max:300000,is_initial_cost:false,note:"무인 기기 점검"},
  {id:102,business_type_id:16,cost_category:"other",cost_name:"기타 고정비",amount_monthly_min:500000,amount_monthly_max:500000,is_initial_cost:false,note:"CCTV/소모품"},
  {id:103,business_type_id:16,cost_category:"equipment",cost_name:"무인커피머신/키오스크",amount_monthly_min:8000000,amount_monthly_max:30000000,is_initial_cost:true,note:"무인 자동화 기기"},
  {id:104,business_type_id:16,cost_category:"equipment",cost_name:"인테리어",amount_monthly_min:5000000,amount_monthly_max:18000000,is_initial_cost:true,note:"소형 인테리어"},
];

export function getMiscFixedDefault(businessTypeId: number): number {
  const items = COST_ITEMS.filter(
    c => c.business_type_id === businessTypeId && !c.is_initial_cost &&
      c.cost_category !== 'labor' && c.cost_category !== 'rent' && c.cost_category !== 'material'
  );
  if (items.length === 0) return 0;
  return items.reduce((sum, c) => sum + Math.round((c.amount_monthly_min + c.amount_monthly_max) / 2), 0);
}

export interface CostBreakdown {
  other_fixed: number;
}

export function getCostBreakdown(businessTypeId: number): CostBreakdown {
  const items = COST_ITEMS.filter(
    c => c.business_type_id === businessTypeId && !c.is_initial_cost &&
      c.cost_category !== 'labor' && c.cost_category !== 'rent' && c.cost_category !== 'material'
  );
  const avg = (c: { amount_monthly_min: number; amount_monthly_max: number }) =>
    Math.round((c.amount_monthly_min + c.amount_monthly_max) / 2);

  const other_fixed = items.filter(c => c.cost_category === 'other').reduce((s, c) => s + avg(c), 0);

  return { other_fixed };
}

export function getInvestmentBreakdown(businessTypeId: number, scale: BusinessScale): InvestmentItem[] {
  const initialItems = COST_ITEMS.filter(
    c => c.business_type_id === businessTypeId && c.is_initial_cost
  );

  const scaleFactor = scale === 'small' ? 0.6 : scale === 'large' ? 1.4 : 1.0;

  return initialItems.map(c => {
    let category: InvestmentItem['category'] = 'other';
    if (c.cost_name.includes('보증금')) category = 'deposit';
    else if (c.cost_name.includes('인테리어')) category = 'interior';
    else if (c.cost_name.includes('가맹비') || c.cost_name.includes('가맹')) category = 'franchise';
    else if (c.cost_category === 'equipment') category = 'equipment';
    return {
      category,
      label: c.cost_name,
      amount: Math.round(((c.amount_monthly_min + c.amount_monthly_max) / 2) * scaleFactor),
      editable: true,
    };
  });
}
