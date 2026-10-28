import React, { ReactNode } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { useAppColors } from '@/hooks/useAppColors';

export function Screen({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const palette = useAppColors();
  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ flex: 1, backgroundColor: palette.background }}
    >
      <KeyboardAwareScrollViewCompat
        style={{ flex: 1 }}
        contentContainerStyle={styles.screenContent}
        keyboardShouldPersistTaps="handled"
        bottomOffset={28}
      >
        <View style={styles.screenStack}>
          <View style={styles.header}>
            <Text style={[styles.eyebrow, { color: palette.primary }]}>
              THREE BEARINGS
            </Text>
            <Text style={[styles.title, { color: palette.foreground }]}>
              {title}
            </Text>
            {subtitle ? (
              <Text style={[styles.subtitle, { color: palette.mutedForeground }]}>
                {subtitle}
              </Text>
            ) : null}
          </View>
          {children}
        </View>
      </KeyboardAwareScrollViewCompat>
    </SafeAreaView>
  );
}

export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const palette = useAppColors();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: palette.card,
          borderColor: palette.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function SectionTitle({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
}) {
  const palette = useAppColors();
  return (
    <Text style={[styles.sectionTitle, { color: palette.foreground }, style]}>
      {children}
    </Text>
  );
}

export function BodyText({
  children,
  muted = false,
  style,
}: {
  children: ReactNode;
  muted?: boolean;
  style?: StyleProp<TextStyle>;
}) {
  const palette = useAppColors();
  return (
    <Text
      style={[
        styles.body,
        { color: muted ? palette.mutedForeground : palette.foreground },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function AppInput({
  style,
  ...props
}: TextInputProps) {
  const palette = useAppColors();
  return (
    <TextInput
      {...props}
      placeholderTextColor={palette.mutedForeground}
      selectionColor={palette.primary}
      style={[
        styles.input,
        {
          color: palette.foreground,
          backgroundColor: palette.background,
          borderColor: palette.border,
        },
        style,
      ]}
    />
  );
}

export function AppButton({
  label,
  onPress,
  selected = false,
  variant = 'outline',
  disabled = false,
  compact = false,
  testID,
}: {
  label: string;
  onPress: () => void;
  selected?: boolean;
  variant?: 'outline' | 'primary' | 'danger';
  disabled?: boolean;
  compact?: boolean;
  testID?: string;
}) {
  const palette = useAppColors();
  const isPrimary = variant === 'primary' || selected;
  const backgroundColor =
    variant === 'danger'
      ? palette.destructive
      : isPrimary
        ? palette.primary
        : palette.secondary;
  const textColor =
    isPrimary || variant === 'danger'
      ? palette.primaryForeground
      : palette.foreground;
  return (
    <Pressable
      accessibilityRole="button"
      testID={testID}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        compact && styles.buttonCompact,
        { backgroundColor, opacity: disabled ? 0.45 : pressed ? 0.76 : 1 },
        !isPrimary && variant !== 'danger' && { borderColor: palette.border, borderWidth: 1 },
      ]}
    >
      <Text style={[styles.buttonText, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

export function StorageBanner({ message }: { message: string | null }) {
  const palette = useAppColors();
  if (!message) return null;
  return (
    <View
      accessibilityRole="alert"
      style={[
        styles.storageBanner,
        { backgroundColor: palette.destructive + '16', borderColor: palette.destructive + '55' },
      ]}
    >
      <Text style={{ color: palette.destructive, fontSize: 13, lineHeight: 19 }}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 112,
  },
  screenStack: { gap: 18 },
  header: { gap: 6, paddingBottom: 3 },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2.1,
  },
  title: {
    fontFamily: 'Lora_500Medium',
    fontSize: 30,
    lineHeight: 38,
  },
  subtitle: { fontSize: 14, lineHeight: 21, maxWidth: 360 },
  card: {
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
    gap: 14,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', lineHeight: 22 },
  body: { fontSize: 14, lineHeight: 21 },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    lineHeight: 22,
    textAlignVertical: 'top',
  },
  button: {
    minHeight: 44,
    borderRadius: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonCompact: { minHeight: 36, paddingHorizontal: 12, borderRadius: 12 },
  buttonText: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  storageBanner: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
});
