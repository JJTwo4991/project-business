import { describe, it, expect } from 'vitest';
import { getScaleSqm } from '../src/lib/scale';
import { getScaleDescriptions, getScaleDescription } from '../src/data/scaleDescriptions';

describe('getScaleSqm', () => {
  it('기본값 small=33, medium=50, large=66', () => {
    expect(getScaleSqm('small')).toBe(33);
    expect(getScaleSqm('medium')).toBe(50);
    expect(getScaleSqm('large')).toBe(66);
  });

  it('업종별 차등 면적 적용', () => {
    // 커피전문점 대형 = 100㎡
    expect(getScaleSqm('large', 2)).toBe(100);
    // 네일샵 소형 = 16㎡
    expect(getScaleSqm('small', 11)).toBe(16);
  });
});

describe('getScaleDescriptions', () => {
  it('업종별 3개 규모 설명 반환', () => {
    const descs = getScaleDescriptions(1);
    expect(descs).toHaveLength(3);
    expect(descs.map(d => d.scale)).toEqual(['small', 'medium', 'large']);
  });

  it('없는 업종은 기본값 반환', () => {
    const descs = getScaleDescriptions(999);
    expect(descs).toHaveLength(3);
  });
});

describe('getScaleDescription', () => {
  it('특정 규모 설명 반환', () => {
    const desc = getScaleDescription(1, 'medium');
    expect(desc).toBeDefined();
    expect(desc!.sqm).toBe(50);
  });

  it('없는 업종은 undefined', () => {
    expect(getScaleDescription(999, 'small')).toBeUndefined();
  });
});
