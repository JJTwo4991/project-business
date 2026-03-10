import { describe, it, expect } from 'vitest';
import { getGuideline, type GuidelineStep } from '../src/data/guidelines';
import { BUSINESS_TYPES } from '../src/data/businessTypes';
import type { BusinessScale } from '../src/types';

describe('getGuideline', () => {
  const scales: BusinessScale[] = ['small', 'medium', 'large'];
  const stepsWithGuidelines: GuidelineStep[] = [
    'select-scale', 'investment-breakdown', 'set-investment',
    'set-loan', 'set-customers', 'set-ticket', 'set-labor',
  ];

  it('returns non-null guideline for all business types × scales × key steps', () => {
    for (const bt of BUSINESS_TYPES) {
      for (const scale of scales) {
        for (const step of stepsWithGuidelines) {
          const g = getGuideline(bt.id, scale, step);
          expect(g, `bt=${bt.name} scale=${scale} step=${step}`).not.toBeNull();
          expect(g!.text.length).toBeGreaterThan(0);
          expect(g!.source.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('returns null for set-rent and select-region (handled by component)', () => {
    for (const bt of BUSINESS_TYPES) {
      expect(getGuideline(bt.id, 'medium', 'set-rent')).toBeNull();
      expect(getGuideline(bt.id, 'medium', 'select-region')).toBeNull();
    }
  });

  it('returns null for unknown business type', () => {
    expect(getGuideline(999, 'medium', 'set-customers')).toBeNull();
  });

  it('guideline text varies by scale for select-scale step', () => {
    const small = getGuideline(1, 'small', 'select-scale');
    const large = getGuideline(1, 'large', 'select-scale');
    expect(small).not.toBeNull();
    expect(large).not.toBeNull();
    expect(small!.text).not.toBe(large!.text);
  });

  it('guideline text varies by scale for set-customers step', () => {
    const small = getGuideline(2, 'small', 'set-customers');
    const medium = getGuideline(2, 'medium', 'set-customers');
    expect(small).not.toBeNull();
    expect(medium).not.toBeNull();
    expect(small!.text).not.toBe(medium!.text);
  });

  it('common guidelines (labor, loan) are same across business types', () => {
    const labor1 = getGuideline(1, 'medium', 'set-labor');
    const labor2 = getGuideline(2, 'medium', 'set-labor');
    expect(labor1).not.toBeNull();
    expect(labor2).not.toBeNull();
    expect(labor1!.text).toBe(labor2!.text);

    const loan1 = getGuideline(1, 'medium', 'set-loan');
    const loan2 = getGuideline(2, 'medium', 'set-loan');
    expect(loan1!.text).toBe(loan2!.text);
  });
});
