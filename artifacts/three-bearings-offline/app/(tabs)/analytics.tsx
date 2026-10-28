import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';
import { NEEDS, NeedId } from '@/constants/needs';
import { localDateKey, useOfflineStore } from '@/context/offline-store';
import { UI } from '@/data/translations';
import { AppButton, BodyText, Card, Screen, SectionTitle } from '@/components/primitives';
import { useAppColors } from '@/hooks/useAppColors';

type Period = 7 | 14 | 30;

export default function AnalyticsScreen() {
  const { data } = useOfflineStore();
  const palette = useAppColors();
  const language = data.settings.language;
  const t = UI[language];
  const [period, setPeriod] = useState<Period>(7);
  const copy =
    language === 'ru'
      ? {
          empty: 'Здесь появится динамика, когда вы начнёте отмечать дни.',
          noPeaks: 'Дни с оценками 8 и выше появятся здесь.',
          average: 'Средняя оценка',
          reviews: 'Что помогло из планов',
          noReviews: 'Пока нет заметок о вчерашних действиях.',
          record: 'дней с записями',
        }
      : {
          empty: 'Your pattern will appear here after a few check-ins.',
          noPeaks: 'Days with a score of 8 or higher will appear here.',
          average: 'Average score',
          reviews: 'What worked from your plans',
          noReviews: 'No reflections on planned actions yet.',
          record: 'days recorded',
        };

  const entries = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - (period - 1));
    const start = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, '0')}-${String(cutoff.getDate()).padStart(2, '0')}`;
    return Object.values(data.days)
      .filter((entry) => entry.date >= start && entry.date <= localDateKey())
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [data.days, period]);

  const averages = useMemo(() => {
    const result: Record<NeedId, number> = { autonomy: 0, competence: 0, relatedness: 0 };
    for (const need of NEEDS) {
      result[need] = entries.length
        ? entries.reduce((total, entry) => total + entry.scores[need], 0) / entries.length
        : 0;
    }
    return result;
  }, [entries]);

  const peaks = useMemo(
    () =>
      entries
        .flatMap((entry) =>
          NEEDS.map((need) => ({ date: entry.date, need, score: entry.scores[need], note: entry.note })),
        )
        .filter((item) => item.score >= 8)
        .sort((a, b) => b.score - a.score || b.date.localeCompare(a.date))
        .slice(0, 5),
    [entries],
  );
  const reviews = entries
    .filter((entry) => entry.yesterdayReview.trim())
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);
  const [chartWidth, setChartWidth] = useState(300);
  const chartHeight = 170;

  const pointsFor = (need: NeedId) =>
    entries
      .map((entry, index) => {
        const x =
          entries.length <= 1
            ? chartWidth / 2
            : 8 + (index / (entries.length - 1)) * (chartWidth - 16);
        const y = chartHeight - 12 - (entry.scores[need] / 10) * (chartHeight - 28);
        return `${x},${y}`;
      })
      .join(' ');

  return (
    <Screen title={t.insights_title} subtitle={t.insights_subtitle}>
      <View style={styles.periodRow}>
        {([7, 14, 30] as Period[]).map((value) => (
          <AppButton
            key={value}
            compact
            selected={period === value}
            label={value === 7 ? t.insights_days_7 : value === 14 ? t.insights_days_14 : t.insights_days_30}
            onPress={() => setPeriod(value)}
          />
        ))}
      </View>

      <Card>
        <SectionTitle>{t.insights_chart_title}</SectionTitle>
        {entries.length ? (
          <>
            <View
              style={styles.chart}
              onLayout={(event) => setChartWidth(Math.max(220, event.nativeEvent.layout.width))}
            >
              <Svg width={chartWidth} height={chartHeight}>
                {[0, 2, 4, 6, 8, 10].map((score) => {
                  const y = chartHeight - 12 - (score / 10) * (chartHeight - 28);
                  return (
                    <Line
                      key={`grid-${score}`}
                      x1={0}
                      x2={chartWidth}
                      y1={y}
                      y2={y}
                      stroke={palette.border}
                      strokeWidth={1}
                      strokeDasharray={score === 0 ? undefined : '3 5'}
                    />
                  );
                })}
                {NEEDS.map((need) => (
                  <React.Fragment key={need}>
                    {entries.length > 1 ? (
                      <Polyline
                        points={pointsFor(need)}
                        fill="none"
                        stroke={palette[need]}
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    ) : null}
                    {entries.map((entry, index) => {
                      const x =
                        entries.length <= 1
                          ? chartWidth / 2
                          : 8 + (index / (entries.length - 1)) * (chartWidth - 16);
                      const y = chartHeight - 12 - (entry.scores[need] / 10) * (chartHeight - 28);
                      return (
                        <Circle
                          key={`${entry.date}-${need}`}
                          cx={x}
                          cy={y}
                          r={3.6}
                          fill={palette[need]}
                        />
                      );
                    })}
                  </React.Fragment>
                ))}
              </Svg>
            </View>
            <View style={styles.legend}>
              {NEEDS.map((need) => (
                <View key={need} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: palette[need] }]} />
                  <Text style={[styles.legendLabel, { color: palette.mutedForeground }]}>
                    {t[`sphere_${need}`]}
                  </Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <BodyText muted>{copy.empty}</BodyText>
        )}
      </Card>

      <Card>
        <View style={styles.averageHeading}>
          <SectionTitle>{copy.average}</SectionTitle>
          <Text style={[styles.entryCount, { color: palette.mutedForeground }]}>
            {entries.length} {copy.record}
          </Text>
        </View>
        {NEEDS.map((need) => (
          <View key={need} style={styles.averageRow}>
            <View style={styles.averageLabel}>
              <Text style={[styles.needLabel, { color: palette.foreground }]}>{t[`sphere_${need}`]}</Text>
              <Text style={[styles.averageValue, { color: palette[need] }]}>
                {averages[need].toFixed(1)}
              </Text>
            </View>
            <View style={[styles.bar, { backgroundColor: palette.secondary }]}>
              <View style={[styles.barFill, { width: `${averages[need] * 10}%`, backgroundColor: palette[need] }]} />
            </View>
          </View>
        ))}
      </Card>

      <Card>
        <SectionTitle>{t.insights_peaks_title}</SectionTitle>
        {peaks.length ? (
          peaks.map((peak, index) => (
            <View key={`${peak.date}-${peak.need}-${index}`} style={[styles.listRow, { borderColor: palette.border }]}>
              <View style={[styles.peakMark, { backgroundColor: palette[peak.need] }]} />
              <View style={styles.flex}>
                <Text style={[styles.needLabel, { color: palette.foreground }]}>
                  {t[`sphere_${peak.need}`]} · {peak.date}
                </Text>
                {peak.note.trim() ? (
                  <Text numberOfLines={2} style={[styles.listSubtext, { color: palette.mutedForeground }]}>
                    {peak.note}
                  </Text>
                ) : null}
              </View>
              <Text style={[styles.peakScore, { color: palette[peak.need] }]}>{peak.score}</Text>
            </View>
          ))
        ) : (
          <BodyText muted>{copy.noPeaks}</BodyText>
        )}
      </Card>

      <Card>
        <SectionTitle>{copy.reviews}</SectionTitle>
        {reviews.length ? (
          reviews.map((entry) => (
            <View key={entry.date} style={[styles.review, { borderColor: palette.border }]}>
              <Text style={[styles.reviewDate, { color: palette.primary }]}>{entry.date}</Text>
              <BodyText>{entry.yesterdayReview}</BodyText>
            </View>
          ))
        ) : (
          <BodyText muted>{copy.noReviews}</BodyText>
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  periodRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 8 },
  chart: { width: '100%', height: 170, alignItems: 'center', overflow: 'hidden' },
  legend: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 11 },
  averageHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  entryCount: { fontSize: 11 },
  averageRow: { gap: 7 },
  averageLabel: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  needLabel: { fontSize: 13, fontWeight: '600' },
  averageValue: { fontSize: 14, fontWeight: '700' },
  bar: { height: 7, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 11 },
  peakMark: { width: 4, height: 34, borderRadius: 2 },
  flex: { flex: 1 },
  listSubtext: { fontSize: 12, lineHeight: 18, marginTop: 2 },
  peakScore: { fontFamily: 'Lora_600SemiBold', fontSize: 22 },
  review: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 11, gap: 4 },
  reviewDate: { fontSize: 11, fontWeight: '700' },
});
