import Toast from '../ui/Toast';
import { useApp } from '../../hooks/useApp';

/** Connects the presentational Toast to the store, so ui/ stays state-free. */
export default function ToastHost() {
  const app = useApp();
  return <Toast message={app.toast} />;
}
