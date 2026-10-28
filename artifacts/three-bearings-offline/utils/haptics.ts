import * as Haptics from 'expo-haptics';

export function notifySuccess() {
  try {
    void Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success,
    ).catch(() => undefined);
  } catch {
    // Haptics are optional; they must not interrupt a successful save.
  }
}
