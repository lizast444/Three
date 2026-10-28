import { useColorScheme } from 'react-native';
import colors from '@/constants/colors';
import { useOfflineStore } from '@/context/offline-store';

export function useAppColors() {
  const systemScheme = useColorScheme();
  const { data } = useOfflineStore();
  const scheme =
    data.settings.theme === 'system'
      ? systemScheme === 'dark'
        ? 'dark'
        : 'light'
      : data.settings.theme;
  return colors[scheme];
}
