import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { NEEDS, NeedId } from '@/constants/needs';
import { createDailyEntry, localDateKey, useOfflineStore } from '@/context/offline-store';
import { UI } from '@/data/translations';
import { BodyText, Card, Screen, SectionTitle } from '@/components/primitives';
import { useAppColors } from '@/hooks/useAppColors';
import { Feather } from '@expo/vector-icons';

const needIcons = {
  autonomy: 'wind',
  competence: 'anchor',
  relatedness: 'users',
} as const;

function monthLabel(date: Date, lang: 'ru' | 'en') {
  return date.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', {
    month: 'long',
    year: 'numeric',
  });
}

export default function JournalScreen() {
  const { data } = useOfflineStore();
  const palette = useAppColors();
  const language = data.settings.language;
  const t = UI[language];
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(localDateKey());
  const copy =
    language === 'ru'
      ? {
          weekdays: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
          none: 'В этот день пока нет записи.',
          actions: 'Микро-действия на завтра',
          monthRecords: 'Записей за месяц',
          selected: 'Выбранный день',
        }
      : {
          weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          none: 'There is no entry for this day yet.',
          actions: 'Micro-actions for tomorrow',
          monthRecords: 'Entries this month',
          selected: 'Selected day',
        };
  const firstWeekday = (month.getDay() + 6) % 7;
  const dayCount = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = useMemo(
    () => [...Array(firstWeekday).fill(null), ...Array.from({ length: dayCount }, (_, i) => i + 1)],
    [firstWeekday, dayCount],
  );
  const selectedEntry =
    data.days[selectedDate] ?? createDailyEntry(selectedDate);
  const hasEntry = !!data.days[selectedDate];
  const monthPrefix = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
  const monthEntries = Object.values(data.days).filter((entry) => entry.date.startsWith(monthPrefix));
  const monthlyAverage = (need: NeedId) =>
    monthEntries.length
      ? monthEntries.reduce((sum, entry) => sum + entry.scores[need], 0) / monthEntries.length
      : 0;

  const shiftMonth = (amount: number) =>
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  const dayKey = (day: number) =>
    `${monthPrefix}-${String(day).padStart(2, '0')}`;
  const selectedFormatted = new Date(`${selectedDate}T12:00:00`).toLocaleDateString(
    language === 'ru' ? 'ru-RU' : 'en-US',
    { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
  );

  return (
    <Screen title={t.journal_title} subtitle={t.journal_subtitle}>
      <Card style={styles.calendarCard}>
        <View style={styles.monthBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={language === 'ru' ? 'Предыдущий месяц' : 'Previous month'}
            onPress={() => shiftMonth(-1)}
            style={[styles.arrowButton, { backgroundColor: palette.secondary }]}
          >
            <Feather name="chevron-left" size={20} color={palette.foreground} />
          </Pressable>
          <Text style={[styles.monthTitle, { color: palette.foreground }]}>
            {monthLabel(month, language)}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={language === 'ru' ? 'Следующий месяц' : 'Next month'}
            onPress={() => shiftMonth(1)}
            style={[styles.arrowButton, { backgroundColor: palette.secondary }]}
          >
            <Feather name="chevron-right" size={20} color={palette.foreground} />
          </Pressable>
        </View>
        <View style={styles.calendarGrid}>
          {copy.weekdays.map((weekday) => (
            <Text key={weekday} style={[styles.weekday, { color: palette.mutedForeground }]}>
              {weekday}
            </Text>
          ))}
          {cells.map((day, index) => {
            if (day === null) return <View key={`blank-${index}`} style={styles.dayCell} />;
            const key = dayKey(day);
            const marked = !!data.days[key];
            const selected = key === selectedDate;
            const isToday = key === localDateKey();
            return (
              <Pressable
                key={key}
                accessibilityRole="button"
                accessibilityLabel={key}
                testID={`journal-day-${day}`}
                onPress={() => setSelectedDate(key)}
                style={styles.dayCell}
              >
                <View
                  style={[
                    styles.daySurface,
                    selected
                      ? { backgroundColor: palette.primary }
                      : isToday
                        ? { backgroundColor: palette.warmSurface, borderColor: palette.primary, borderWidth: 1.5 }
                        : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayNumber,
                      { color: selected ? palette.primaryForeground : palette.foreground },
                    ]}
                  >
                    {day}
                  </Text>
                  {marked && !selected ? (
                    <View style={[styles.dayMark, { backgroundColor: palette.primary }]} />
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      </Card>

      {monthEntries.length ? (
        <Card>
          <SectionTitle>{`${copy.monthRecords} ${t.journal_month_stats_suffix}`}</SectionTitle>
          <Text style={[styles.monthCount, { color: palette.mutedForeground }]}>
            {monthEntries.length} {t.journal_records.toLocaleLowerCase(language === 'ru' ? 'ru-RU' : 'en-US')}
          </Text>
          {NEEDS.map((need) => (
            <View key={need} style={styles.monthStat}>
              <Text style={{ color: palette.foreground, fontSize: 13 }}>{t[`sphere_${need}`]}</Text>
              <Text style={{ color: palette[need], fontSize: 14, fontWeight: '700' }}>
                {monthlyAverage(need).toFixed(1)}/10
              </Text>
            </View>
          ))}
        </Card>
      ) : null}

      <Animated.View key={selectedDate} entering={FadeInDown.duration(260)}>
      <Card>
        <Text style={[styles.selectedDate, { color: palette.mutedForeground }]}>
          {copy.selected}
        </Text>
        <SectionTitle>{selectedFormatted}</SectionTitle>
        {hasEntry ? (
          <>
            <View style={styles.scores}>
              {NEEDS.map((need) => (
                <View key={need} style={[styles.scorePill, { backgroundColor: palette.secondary }]}>
                  <View style={[styles.scoreDot, { backgroundColor: palette[need] }]} />
                  <Text style={{ color: palette.foreground, fontSize: 12 }}>
                    {t[`sphere_${need}`]} {selectedEntry.scores[need]}
                  </Text>
                </View>
              ))}
            </View>
            {selectedEntry.note.trim() ? (
              <View style={[styles.detailBlock, { borderColor: palette.border }]}>
                <Text style={[styles.smallTitle, { color: palette.mutedForeground }]}>{t.journal_note}</Text>
                <BodyText>{selectedEntry.note}</BodyText>
                <View style={styles.tagRow}>
                  {selectedEntry.noteTags.map((tag) => (
                    <Text key={tag} style={[styles.tag, { backgroundColor: palette[tag] + '22', color: palette[tag] }]}>
                      {t[`sphere_${tag}`]}
                    </Text>
                  ))}
                </View>
              </View>
            ) : null}
            {NEEDS.map((need, needIndex) => {
              const answers = selectedEntry.answers[need] ?? [];
              const filledAnswers = answers.filter((answer) => answer.answer.trim());
              if (!filledAnswers.length) return null;
              const softColor =
                need === 'autonomy'
                  ? palette.autonomySoft
                  : need === 'competence'
                    ? palette.competenceSoft
                    : palette.relatednessSoft;
              return (
                <Animated.View
                  key={need}
                  entering={FadeInDown.duration(280).delay(needIndex * 65)}
                  style={styles.answerGroup}
                >
                  <View style={styles.answerHeading}>
                    <View style={[styles.answerIcon, { backgroundColor: softColor }]}>
                      <Feather name={needIcons[need]} size={15} color={palette[need]} />
                    </View>
                    <Text style={[styles.answerHeadingLabel, { color: palette[need] }]}>
                      {t[`sphere_${need}`]}
                    </Text>
                  </View>
                  {filledAnswers.map((answer, answerIndex) => (
                    <Animated.View
                      key={answer.question}
                      entering={FadeInDown.duration(240).delay(answerIndex * 50)}
                      style={[
                        styles.answerCard,
                        { backgroundColor: softColor, borderColor: palette.border },
                      ]}
                    >
                      <Text style={[styles.answerQuestion, { color: palette.mutedForeground }]}>
                        “{answer.question}”
                      </Text>
                      <View style={[styles.answerDivider, { backgroundColor: palette.border }]} />
                      <Text style={[styles.answerText, { color: palette.foreground }]}>
                        {answer.answer.trim()}
                      </Text>
                    </Animated.View>
                  ))}
                </Animated.View>
              );
            })}
            {selectedEntry.microActions.length ? (
              <View style={[styles.detailBlock, { borderColor: palette.border }]}>
                <Text style={[styles.smallTitle, { color: palette.mutedForeground }]}>{copy.actions}</Text>
                {selectedEntry.microActions.map((action) => (
                  <Text key={action.sphere} style={{ color: palette.foreground, fontSize: 13, lineHeight: 20 }}>
                    · {t[`sphere_${action.sphere}`]} — {action.action}
                  </Text>
                ))}
              </View>
            ) : null}
            {selectedEntry.yesterdayReview.trim() ? (
              <View style={[styles.detailBlock, { borderColor: palette.border }]}>
                <Text style={[styles.smallTitle, { color: palette.mutedForeground }]}>{t.journal_yesterday_review}</Text>
                <BodyText>{selectedEntry.yesterdayReview}</BodyText>
              </View>
            ) : null}
          </>
        ) : (
          <BodyText muted>{t.journal_no_data || copy.none}</BodyText>
        )}
      </Card>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  calendarCard: { padding: 15, gap: 15 },
  monthBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  arrowButton: { width: 36, height: 36, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  monthTitle: { fontFamily: 'Lora_500Medium', fontSize: 17, textTransform: 'capitalize' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  weekday: { width: '14.2857%', textAlign: 'center', fontSize: 11, paddingVertical: 8 },
  dayCell: { width: '14.2857%', height: 48, alignItems: 'center', justifyContent: 'center' },
  daySurface: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 15 },
  dayNumber: { fontSize: 13, lineHeight: 18, fontFamily: 'DMSans_500Medium' },
  dayMark: { width: 4, height: 4, borderRadius: 2, marginTop: 2 },
  monthCount: { fontSize: 12, marginTop: -8 },
  monthStat: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8 },
  selectedDate: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 },
  scores: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  scorePill: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 12, paddingVertical: 7, paddingHorizontal: 9 },
  scoreDot: { width: 6, height: 6, borderRadius: 3 },
  detailBlock: { gap: 7, borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 12 },
  smallTitle: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.65, fontWeight: '700' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { borderRadius: 9, paddingHorizontal: 9, paddingVertical: 5, fontSize: 11, overflow: 'hidden' },
  answerGroup: { gap: 9 },
  answerHeading: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  answerIcon: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 15 },
  answerHeadingLabel: { fontFamily: 'DMSans_600SemiBold', fontSize: 13, letterSpacing: 0.3 },
  answerCard: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 18, padding: 14, gap: 10 },
  answerQuestion: { fontFamily: 'Lora_400Regular_Italic', fontSize: 14, lineHeight: 22 },
  answerDivider: { height: StyleSheet.hairlineWidth },
  answerText: { fontFamily: 'DMSans_400Regular', fontSize: 14, lineHeight: 22 },
});
