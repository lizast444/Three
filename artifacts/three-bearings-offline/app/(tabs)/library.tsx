import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { CATEGORIES, CategoryId } from '@/constants/needs';
import { useOfflineStore } from '@/context/offline-store';
import {
  getSphereLabel,
  LIBRARY_QUESTIONS_I18N,
  UI,
} from '@/data/translations';
import {
  AppButton,
  AppInput,
  BodyText,
  Card,
  Screen,
  SectionTitle,
  StorageBanner,
} from '@/components/primitives';
import { useAppColors } from '@/hooks/useAppColors';

const categoryColorKey = (category: CategoryId) =>
  category === 'universal' ? 'primary' : category;

export default function LibraryScreen() {
  const { data, addLibraryNote, deleteLibraryNote, saveError } = useOfflineStore();
  const palette = useAppColors();
  const language = data.settings.language;
  const t = UI[language];
  const copy =
    language === 'ru'
      ? {
          saveAnswer: 'Сохранить ответ',
          answer: 'Ответить на вопрос',
          placeholder: 'Запишите свою мысль...',
          savedNotes: 'Мои заметки',
          noNotes: 'Сохранённые ответы и заметки появятся здесь.',
          saved: 'Ответ сохранён на устройстве',
          search: 'Найти вопрос',
        }
      : {
          saveAnswer: 'Save answer',
          answer: 'Write an answer',
          placeholder: 'Write your reflection...',
          savedNotes: 'My notes',
          noNotes: 'Saved answers and notes will appear here.',
          saved: 'Answer saved on this device',
          search: 'Find a question',
        };
  const [category, setCategory] = useState<CategoryId>('autonomy');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [answering, setAnswering] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');
  const questions = LIBRARY_QUESTIONS_I18N[language][category] ?? [];
  const visibleQuestions = useMemo(() => {
    const query = search.trim().toLocaleLowerCase(language === 'ru' ? 'ru' : 'en');
    return questions
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => !query || item.question.toLocaleLowerCase(language === 'ru' ? 'ru' : 'en').includes(query));
  }, [questions, search, language]);
  const notes = data.libraryNotes.filter((note) => note.category === category);

  const saveAnswer = (question: string) => {
    if (!draft.trim()) return;
    addLibraryNote({
      category,
      question,
      content: draft.trim(),
    });
    setDraft('');
    setAnswering(null);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <Screen title={t.library_title} subtitle={t.library_subtitle}>
      <StorageBanner message={saveError ? (language === 'ru' ? 'Не удалось сохранить заметку. Проверьте свободное место и повторите.' : 'Could not save the note. Check storage space and try again.') : null} />
      <View style={styles.categoryScroller}>
        {CATEGORIES.map((item) => (
          <AppButton
            key={item}
            compact
            selected={category === item}
            label={item === 'universal' ? t.library_universal : getSphereLabel(item, t)}
            onPress={() => {
              setCategory(item);
              setSearch('');
              setAnswering(null);
            }}
          />
        ))}
      </View>
      <AppInput
        value={search}
        onChangeText={setSearch}
        placeholder={copy.search}
        returnKeyType="search"
        testID="library-search"
      />
      <Card style={styles.libraryCard}>
        <View style={styles.libraryHeading}>
          <View style={[styles.categoryDot, { backgroundColor: palette[categoryColorKey(category)] }]} />
          <SectionTitle>{category === 'universal' ? t.library_universal : getSphereLabel(category, t)}</SectionTitle>
          <Text style={[styles.count, { color: palette.mutedForeground }]}>
            {questions.length}
          </Text>
        </View>
        {visibleQuestions.length ? (
          visibleQuestions.map(({ item, index }) => {
            const key = `${category}-${index}`;
            const isExpanded = !!expanded[key];
            return (
              <View key={key} style={[styles.questionCard, { backgroundColor: palette.muted, borderColor: palette.border }]}>
                <Text style={[styles.questionNumber, { color: palette[categoryColorKey(category)] }]}>
                  {String(index + 1).padStart(2, '0')}
                </Text>
                <Text style={[styles.questionText, { color: palette.foreground }]}>
                  {item.question}
                </Text>
                <View style={styles.questionActions}>
                  <AppButton
                    compact
                    selected={isExpanded}
                    label={isExpanded ? t.library_hide_hints : t.library_hints}
                    onPress={() => setExpanded((current) => ({ ...current, [key]: !current[key] }))}
                  />
                  <AppButton
                    compact
                    label={answering === key ? t.cancel : copy.answer}
                    onPress={() => {
                      setAnswering(answering === key ? null : key);
                      setDraft('');
                    }}
                  />
                </View>
                {isExpanded ? (
                  <View style={styles.hints}>
                    {item.hints.map((hint, hintIndex) => (
                      <View key={`${key}-hint-${hintIndex}`} style={styles.hintRow}>
                        <View style={[styles.hintDot, { backgroundColor: palette[categoryColorKey(category)] }]} />
                        <Text style={[styles.hintText, { color: palette.mutedForeground }]}>
                          {hint}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : null}
                {answering === key ? (
                  <View style={styles.answerForm}>
                    <AppInput
                      multiline
                      value={draft}
                      onChangeText={setDraft}
                      placeholder={copy.placeholder}
                      style={styles.answerInput}
                      testID={`library-answer-${index}`}
                    />
                    <AppButton
                      variant="primary"
                      disabled={!draft.trim()}
                      label={copy.saveAnswer}
                      onPress={() => saveAnswer(item.question)}
                    />
                  </View>
                ) : null}
              </View>
            );
          })
        ) : (
          <BodyText muted>
            {language === 'ru' ? 'Вопросов по этому запросу не найдено.' : 'No questions match this search.'}
          </BodyText>
        )}
      </Card>

      <Card>
        <SectionTitle>{copy.savedNotes}</SectionTitle>
        {notes.length === 0 ? (
          <BodyText muted>{copy.noNotes}</BodyText>
        ) : (
          notes.map((note) => (
            <View key={note.id} style={[styles.savedNote, { borderColor: palette.border }]}>
              {note.question ? (
                <Text style={[styles.savedQuestion, { color: palette.mutedForeground }]}>
                  {note.question}
                </Text>
              ) : null}
              <BodyText>{note.content}</BodyText>
              <View style={styles.noteFooter}>
                <Text style={[styles.dateText, { color: palette.mutedForeground }]}>
                  {new Date(note.createdAt).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US')}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t.delete}
                  testID={`delete-note-${note.id}`}
                  onPress={() => deleteLibraryNote(note.id)}
                >
                  <Text style={{ color: palette.destructive, fontSize: 13, fontWeight: '600' }}>
                    {t.delete}
                  </Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  categoryScroller: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  libraryCard: { padding: 14, gap: 12 },
  libraryHeading: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 3 },
  categoryDot: { width: 9, height: 9, borderRadius: 5 },
  count: { marginLeft: 'auto', fontSize: 13 },
  questionCard: { borderWidth: 1, borderRadius: 17, padding: 14, gap: 10 },
  questionNumber: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  questionText: { fontFamily: 'Lora_400Regular', fontSize: 15, lineHeight: 23 },
  questionActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  hints: { gap: 9, paddingTop: 3 },
  hintRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 9 },
  hintDot: { width: 5, height: 5, borderRadius: 3, marginTop: 8 },
  hintText: { flex: 1, fontSize: 13, lineHeight: 20 },
  answerForm: { gap: 10, paddingTop: 5 },
  answerInput: { minHeight: 94 },
  savedNote: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 12, gap: 7 },
  savedQuestion: { fontFamily: 'Lora_400Regular_Italic', fontSize: 13, lineHeight: 20 },
  noteFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateText: { fontSize: 11 },
});
