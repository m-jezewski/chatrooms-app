import { useSelector } from 'react-redux';
import { RootState } from '../../store.ts';
import styles from './ConnectionBanner.module.scss';

export const ConnectionBanner = () => {
  const isConnected = useSelector((state: RootState) => state.messages.isConnected);
  const connectionProblem = useSelector((state: RootState) => state.messages.error);

  if (isConnected) {
    return null;
  }

  return <p className={styles.connection}>{connectionProblem ?? 'Connecting to the chat server…'}</p>;
};
