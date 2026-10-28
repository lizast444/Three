import { NEEDS, type NeedId } from './needs';
import { INSPIRATION_IDEAS_I18N, SOCRATIC_POOL_I18N } from './translations';

export interface DailyEntry {
  date: string;
  scores: Record<NeedId, number>;
  answers: Partial<Record<NeedId, { question: string; answer: string }[]>>;
  note: string;
  noteTags: NeedId[];
  microActions: { sphere: NeedId; action: string }[];
  yesterdayReview: string;
}

const today = new Date();
const dateKey = [
  today.getFullYear(),
  String(today.getMonth() + 1).padStart(2, '0'),
  String(today.getDate()).padStart(2, '0'),
].join('-');
const yesterdayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
const yesterdayKey = [
  yesterdayDate.getFullYear(),
  String(yesterdayDate.getMonth() + 1).padStart(2, '0'),
  String(yesterdayDate.getDate()).padStart(2, '0'),
].join('-');

const question = (need: NeedId) => SOCRATIC_POOL_I18N.ru[need][0];

const todayEntry: DailyEntry = {
  date: dateKey,
  scores: { autonomy: 7, competence: 6, relatedness: 8 },
  answers: {
    autonomy: [{ question: question('autonomy'), answer: 'Выбрал важное для себя и оставил место для отдыха.' }],
    competence: [{ question: question('competence'), answer: 'Продвинулся в одном деле, которое откладывал.' }],
    relatedness: [{ question: question('relatedness'), answer: 'Поговорил с близким человеком без спешки.' }],
  },
  note: 'Спокойный день с хорошим балансом.',
  noteTags: ['autonomy', 'relatedness'],
  microActions: [
    { sphere: 'autonomy', action: INSPIRATION_IDEAS_I18N.ru.autonomy[0] },
  ],
  yesterdayReview: 'Прогулка помогла переключиться.',
};

const yesterdayEntry: DailyEntry = {
  date: yesterdayKey,
  scores: { autonomy: 6, competence: 7, relatedness: 7 },
  answers: {},
  note: '',
  noteTags: [],
  microActions: [
    { sphere: 'competence', action: INSPIRATION_IDEAS_I18N.ru.competence[0] },
  ],
  yesterdayReview: '',
};

const data = {
  settings: {
    language: 'ru' as const,
    theme: 'light' as const,
    questionIndexes: { autonomy: 0, competence: 0, relatedness: 0 },
    ideaIndexes: { autonomy: 0, competence: 0, relatedness: 0 },
  },
  days: { [dateKey]: todayEntry, [yesterdayKey]: yesterdayEntry },
};

export function localDateKey() {
  return dateKey;
}

export function shiftDateKey(_date: string, amount: number) {
  return amount === -1 ? yesterdayKey : dateKey;
}

export function useOfflineStore() {
  return {
    data,
    saveError: null as string | null,
    updateDay: (_date: string, _update: (day: DailyEntry) => DailyEntry) => undefined,
    updateSettings: (_update: (settings: typeof data.settings) => typeof data.settings) => undefined,
  };
}
