import colors from './colors';
import { useOfflineStore } from './offline-store';

export function useAppColors() {
  const { data } = useOfflineStore();
  return colors[data.settings.theme === 'dark' ? 'dark' : 'light'];
}
