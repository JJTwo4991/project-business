import type { BusinessScale } from '../types';
import { SCALE_DESCRIPTIONS } from '../data/scaleDescriptions';

const DEFAULT_SQM: Record<BusinessScale, number> = {
  small: 33,
  medium: 50,
  large: 66,
};

export function getScaleSqm(scale: BusinessScale, businessTypeId?: number): number {
  if (businessTypeId) {
    const desc = SCALE_DESCRIPTIONS[businessTypeId]?.find(s => s.scale === scale);
    if (desc) return desc.sqm;
  }
  return DEFAULT_SQM[scale];
}
