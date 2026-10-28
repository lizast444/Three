export const NEEDS = ['autonomy', 'competence', 'relatedness'] as const;

export type NeedId = (typeof NEEDS)[number];
export type CategoryId = NeedId | 'universal';

export const CATEGORIES: CategoryId[] = [
  'autonomy',
  'competence',
  'relatedness',
  'universal',
];
