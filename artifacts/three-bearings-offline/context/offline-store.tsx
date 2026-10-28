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
import type { CategoryId, NeedId } from '@/constants/needs';

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

function parseStoredState(raw: string): OfflineState {
  const parsed: unknown = JSON.parse(raw);
  if (
    !parsed ||
    typeof parsed !== 'object' ||
    (parsed as OfflineState).version !== 1 ||
    typeof (parsed as OfflineState).days !== 'object' ||
    !Array.isArray((parsed as OfflineState).libraryNotes)
  ) {
    throw new Error('Stored app data has an unsupported format.');
  }
  const state = parsed as OfflineState;
  if (!state.settings || !state.settings.questionIndexes || !state.settings.ideaIndexes) {
    throw new Error('Stored settings are incomplete.');
  }
  return state;
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
