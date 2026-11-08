import { doc, onSnapshot, serverTimestamp, setDoc, Timestamp } from 'firebase/firestore';
import type { Firestore, Unsubscribe } from 'firebase/firestore';
import { COLLECTIONS } from '../constants/index.ts';

export interface ScoringReset {
  resetAt: Timestamp;
  resetBy: string;
}

export function resetScores(database: Firestore, email: string): Promise<void> {
  return setDoc(doc(database, COLLECTIONS.SCORING_SETTINGS, 'global'), {
    resetAt: serverTimestamp(),
    resetBy: email.trim().toLowerCase(),
  });
}

export function subscribeToScoringReset(
  database: Firestore,
  onChange: (reset: ScoringReset | null) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(doc(database, COLLECTIONS.SCORING_SETTINGS, 'global'), snapshot => {
    if (snapshot.metadata.hasPendingWrites) return;
    if (!snapshot.exists()) { onChange(null); return; }
    const data = snapshot.data();
    if (!(data.resetAt instanceof Timestamp) || typeof data.resetBy !== 'string') {
      onError(new Error('Data resetării punctajelor este invalidă. Contactează un administrator IT.'));
      return;
    }
    onChange({ resetAt: data.resetAt, resetBy: data.resetBy });
  }, onError);
}
