import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { Lang } from '@/data/translations';
import { CATEGORIES, NEEDS, type CategoryId, type NeedId } from '@/constants/needs';

const STORAGE_KEY = 'three-bearings.local.v1';

export type ThemeMode = 'system' | 'light' | 'dark';

export interface ReflectionAnswer {
  question: string;
  answer: string;
}

export interface MicroAction {
  sphere: NeedId;
  action: string;
}

export interface DailyEntry {
  date: string;
  scores: Record<NeedId, number>;
  answers: Partial<Record<NeedId, ReflectionAnswer[]>>;
  note: string;
  noteTags: NeedId[];
  microActions: MicroAction[];
  yesterdayReview: string;
}

export interface LibraryNote {
  id: string;
  category: CategoryId;
  question: string;
  content: string;
  createdAt: string;
}

export interface OfflineState {
  version: 1;
  settings: {
    language: Lang;
    theme: ThemeMode;
    questionIndexes: Record<NeedId, number>;
    ideaIndexes: Record<NeedId, number>;
  };
  days: Record<string, DailyEntry>;
  libraryNotes: LibraryNote[];
}

function freshState(): OfflineState {
  return {
    version: 1,
    settings: {
      language: 'ru',
      theme: 'system',
      questionIndexes: { autonomy: 0, competence: 0, relatedness: 0 },
      ideaIndexes: { autonomy: 0, competence: 0, relatedness: 0 },
    },
    days: {},
    libraryNotes: [],
  };
}

export function createDailyEntry(date: string): DailyEntry {
  return {
    date,
    scores: { autonomy: 5, competence: 5, relatedness: 5 },
    answers: {},
    note: '',
    noteTags: [],
    microActions: [],
    yesterdayReview: '',
  };
}

export function localDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function shiftDateKey(date: string, amount: number): string {
  const [year, month, day] = date.split('-').map(Number);
  const result = new Date(year, month - 1, day + amount);
  return localDateKey(result);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNeedId(value: unknown): value is NeedId {
  return typeof value === 'string' && (NEEDS as readonly string[]).includes(value);
}

function isCategoryId(value: unknown): value is CategoryId {
  return typeof value === 'string' && (CATEGORIES as readonly string[]).includes(value);
}

function hasValidIndexes(value: unknown): boolean {
  return (
    isRecord(value) &&
    NEEDS.every(
      (need) =>
        typeof value[need] === 'number' &&
        Number.isSafeInteger(value[need]) &&
        (value[need] as number) >= 0,
    )
  );
}

function isScoreRecord(value: unknown): value is Record<NeedId, number> {
  return (
    isRecord(value) &&
    NEEDS.every((need) => {
      const score = value[need];
      return (
        typeof score === 'number' &&
        Number.isInteger(score) &&
        score >= 0 &&
        score <= 10
      );
    })
  );
}

function parseState(value: unknown): OfflineState {
  if (!isRecord(value) || value.version !== 1) {
    throw new Error('This backup format is not supported.');
  }
  const settings = value.settings;
  const days = value.days;
  const libraryNotes = value.libraryNotes;
  if (
    !isRecord(settings) ||
    (settings.language !== 'ru' && settings.language !== 'en') ||
    !['system', 'light', 'dark'].includes(String(settings.theme)) ||
    !hasValidIndexes(settings.questionIndexes) ||
    !hasValidIndexes(settings.ideaIndexes) ||
    !isRecord(days) ||
    !Array.isArray(libraryNotes)
  ) {
    throw new Error('The backup is incomplete or damaged.');
  }

  const validDays = Object.entries(days).every(([date, rawEntry]) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !isRecord(rawEntry)) return false;
    if (
      rawEntry.date !== date ||
      typeof rawEntry.note !== 'string' ||
      typeof rawEntry.yesterdayReview !== 'string' ||
      !isScoreRecord(rawEntry.scores) ||
      !isRecord(rawEntry.answers) ||
      !Object.entries(rawEntry.answers).every(
        ([need, answers]) =>
          isNeedId(need) &&
          Array.isArray(answers) &&
          answers.every(
            (answer) =>
              isRecord(answer) &&
              typeof answer.question === 'string' &&
              typeof answer.answer === 'string',
          ),
      ) ||
      !Array.isArray(rawEntry.noteTags) ||
      !rawEntry.noteTags.every(isNeedId) ||
      !Array.isArray(rawEntry.microActions) ||
      !rawEntry.microActions.every(
        (action) =>
          isRecord(action) &&
          isNeedId(action.sphere) &&
          typeof action.action === 'string',
      )
    ) {
      return false;
    }
    return true;
  });
  const validNotes = libraryNotes.every(
    (note) =>
      isRecord(note) &&
      typeof note.id === 'string' &&
      isCategoryId(note.category) &&
      typeof note.question === 'string' &&
      typeof note.content === 'string' &&
      typeof note.createdAt === 'string',
  );
  if (!validDays || !validNotes) {
    throw new Error('The backup is incomplete or damaged.');
  }
  return value as unknown as OfflineState;
}

function parseStoredState(raw: string): OfflineState {
  return parseState(JSON.parse(raw) as unknown);
}

export function parseBackupFile(raw: string): OfflineState {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw.replace(/^\uFEFF/, '').trim()) as unknown;
  } catch {
    throw new Error('The selected file is not valid JSON.');
  }

  if (!isRecord(parsed)) {
    throw new Error('This file is not a Three Bearings backup.');
  }

  // Accept both the current export envelope and a raw local-state JSON backup.
  // The latter is useful for files saved by earlier app builds.
  if ('app' in parsed || 'backupVersion' in parsed) {
    if (
      parsed.app !== 'three-bearings-offline' ||
      parsed.backupVersion !== 1
    ) {
      throw new Error('This file is not a Three Bearings backup.');
    }
    return parseState(parsed.data);
  }

  return parseState(parsed);
}

interface StoreContextValue {
  data: OfflineState;
  isHydrated: boolean;
  loadError: string | null;
  saveError: string | null;
  retryHydration: () => void;
  updateDay: (date: string, update: (day: DailyEntry) => DailyEntry) => void;
  updateSettings: (
    update: (settings: OfflineState['settings']) => OfflineState['settings'],
  ) => void;
  addLibraryNote: (
    note: Omit<LibraryNote, 'id' | 'createdAt'>,
  ) => void;
  deleteLibraryNote: (id: string) => void;
  resetAll: () => void;
  replaceData: (next: OfflineState) => Promise<void>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function OfflineStoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OfflineState>(() => freshState());
  const [isHydrated, setIsHydrated] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const dataRef = useRef(data);
  const writeQueue = useRef<Promise<void>>(Promise.resolve());
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setIsHydrated(false);
    setLoadError(null);
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!active) return;
        const next = raw ? parseStoredState(raw) : freshState();
        dataRef.current = next;
        setData(next);
        setIsHydrated(true);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setLoadError(
          error instanceof Error
            ? error.message
            : 'Could not read private app storage.',
        );
      });
    return () => {
      active = false;
    };
  }, [loadAttempt]);

  const commit = useCallback((update: (previous: OfflineState) => OfflineState) => {
    const next = update(dataRef.current);
    dataRef.current = next;
    setData(next);
    const serialized = JSON.stringify(next);
    writeQueue.current = writeQueue.current
      .catch(() => undefined)
      .then(() => AsyncStorage.setItem(STORAGE_KEY, serialized))
      .then(() => setSaveError(null))
      .catch((error: unknown) => {
        setSaveError(
          error instanceof Error
            ? error.message
            : 'Could not save to this device.',
        );
      });
  }, []);

  const updateDay = useCallback(
    (date: string, update: (day: DailyEntry) => DailyEntry) => {
      commit((previous) => {
        const current = previous.days[date] ?? createDailyEntry(date);
        return {
          ...previous,
          days: { ...previous.days, [date]: update(current) },
        };
      });
    },
    [commit],
  );

  const updateSettings = useCallback(
    (update: (settings: OfflineState['settings']) => OfflineState['settings']) => {
      commit((previous) => ({
        ...previous,
        settings: update(previous.settings),
      }));
    },
    [commit],
  );

  const addLibraryNote = useCallback(
    (note: Omit<LibraryNote, 'id' | 'createdAt'>) => {
      const saved: LibraryNote = {
        ...note,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        createdAt: new Date().toISOString(),
      };
      commit((previous) => ({
        ...previous,
        libraryNotes: [saved, ...previous.libraryNotes],
      }));
    },
    [commit],
  );

  const deleteLibraryNote = useCallback(
    (id: string) =>
      commit((previous) => ({
        ...previous,
        libraryNotes: previous.libraryNotes.filter((note) => note.id !== id),
      })),
    [commit],
  );

  const resetAll = useCallback(() => commit(() => freshState()), [commit]);
  const replaceData = useCallback(async (next: OfflineState) => {
    dataRef.current = next;
    setData(next);
    const serialized = JSON.stringify(next);
    const write = writeQueue.current
      .catch(() => undefined)
      .then(() => AsyncStorage.setItem(STORAGE_KEY, serialized));
    writeQueue.current = write
      .then(() => setSaveError(null))
      .catch((error: unknown) => {
        setSaveError(
          error instanceof Error
            ? error.message
            : 'Could not save imported data to this device.',
        );
        throw error;
      });
    await writeQueue.current;
  }, []);
  const retryHydration = useCallback(() => setLoadAttempt((value) => value + 1), []);

  const value = useMemo(
    () => ({
      data,
      isHydrated,
      loadError,
      saveError,
      retryHydration,
      updateDay,
      updateSettings,
      addLibraryNote,
      deleteLibraryNote,
      resetAll,
      replaceData,
    }),
    [
      data,
      isHydrated,
      loadError,
      saveError,
      retryHydration,
      updateDay,
      updateSettings,
      addLibraryNote,
      deleteLibraryNote,
      resetAll,
      replaceData,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useOfflineStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useOfflineStore must be used inside OfflineStoreProvider.');
  }
  return context;
}
