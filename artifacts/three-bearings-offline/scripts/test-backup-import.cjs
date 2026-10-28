const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const appRoot = path.resolve(__dirname, '..');
const moduleCache = new Map();
const reactStub = {
  createContext: () => ({ Provider: {} }),
  createElement: () => null,
  useCallback() {},
  useContext() {},
  useEffect() {},
  useMemo() {},
  useRef() {},
  useState() {},
};

function loadTsModule(relativePath) {
  const fullPath = path.join(appRoot, relativePath);
  if (moduleCache.has(fullPath)) return moduleCache.get(fullPath);

  const source = fs.readFileSync(fullPath, 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.React,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;
  const module = { exports: {} };
  moduleCache.set(fullPath, module.exports);

  const localRequire = (specifier) => {
    if (specifier === 'react') {
      return { __esModule: true, default: reactStub, ...reactStub };
    }
    if (specifier === '@react-native-async-storage/async-storage') {
      return { __esModule: true, default: {} };
    }
    if (specifier === '@/data/translations') {
      return loadTsModule('data/translations.ts');
    }
    if (specifier === '@/constants/needs') {
      return loadTsModule('constants/needs.ts');
    }
    return require(specifier);
  };

  vm.runInNewContext(compiled, {
    module,
    exports: module.exports,
    require: localRequire,
    console,
  });
  return module.exports;
}

const { parseBackupFile } = loadTsModule('context/offline-store.tsx');
const { LIBRARY_QUESTIONS_I18N } = loadTsModule('data/translations.ts');

const webExport = {
  tb_lang: 'en',
  tb_theme: 'dark',
  tb_q_autonomy: '2',
  tb_q_competence: '1',
  tb_q_relatedness: '0',
  tb_days: [
    {
      date: '2026-10-27',
      autonomy_score: 7,
      competence_score: 6,
      relatedness_score: 8,
      autonomy_answers: [{ question: 'Daily prompt', answer: 'Daily answer' }],
      note: 'Day note',
      note_tags: ['autonomy', 'relatedness'],
      micro_actions: [
        { sphere: 'competence', action: 'Practice a skill' },
        { sphere: 'relatedness', action: 'Call a friend' },
      ],
      yesterday_review: 'A useful reflection',
    },
    {
      date: '2026-10-28',
      autonomy_score: 5,
      competence_score: 5,
      relatedness_score: 5,
      micro_action: 'Take a short walk',
      micro_action_sphere: 'autonomy',
    },
  ],
  'tb_deep_2026-10-27_competence': { '0': 'Deep-dive answer' },
};

const migrated = parseBackupFile(JSON.stringify(webExport));
assert.equal(migrated.settings.language, 'en');
assert.equal(migrated.settings.theme, 'dark');
assert.equal(migrated.settings.questionIndexes.autonomy, 2);
assert.equal(migrated.days['2026-10-27'].scores.autonomy, 7);
assert.equal(migrated.days['2026-10-27'].answers.autonomy[0].answer, 'Daily answer');
assert.equal(migrated.days['2026-10-27'].note, 'Day note');
assert.equal(migrated.days['2026-10-27'].microActions.length, 2);
assert.equal(migrated.days['2026-10-28'].microActions[0].action, 'Take a short walk');
assert.equal(migrated.libraryNotes.length, 1);
assert.equal(migrated.libraryNotes[0].category, 'competence');
assert.equal(migrated.libraryNotes[0].question, LIBRARY_QUESTIONS_I18N.en.competence[0].question);
assert.equal(migrated.libraryNotes[0].content, 'Deep-dive answer');

const expoBackup = {
  app: 'three-bearings-offline',
  backupVersion: 1,
  data: migrated,
};
const expoRoundTrip = parseBackupFile(JSON.stringify(expoBackup));
assert.equal(Object.keys(expoRoundTrip.days).length, 2);
assert.equal(expoRoundTrip.libraryNotes[0].content, 'Deep-dive answer');

assert.throws(() => parseBackupFile('not json'), /valid JSON/);
assert.throws(() => parseBackupFile(JSON.stringify({ other: true })), /backup format is not supported/);
assert.throws(
  () => parseBackupFile(JSON.stringify({ app: 'another-app', backupVersion: 1, data: {} })),
  /Three Bearings backup/,
);

console.log('Backup import format tests passed.');
