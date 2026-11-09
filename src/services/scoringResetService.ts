import { doc, onSnapshot, serverTimestamp, setDoc, Timestamp } from 'firebase/firestore';
import type { Firestore, Unsubscribe } from 'firebase/firestore';
import { normalizeEmail } from './memberService';

export function resetScores(database: Firestore, email: string): Promise<void> {
  return setDoc(doc(database, 'scoringSettings', 'global'), {
    resetAt: serverTimestamp(),
    resetBy: normalizeEmail(email),
  });
}

export function subscribeToScoringReset(
  database: Firestore,
  onChange: (resetAt: Timestamp | null) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(doc(database, 'scoringSettings', 'global'), snapshot => {
    if (snapshot.metadata.hasPendingWrites) return;
    if (!snapshot.exists()) { onChange(null); return; }
    const resetAt = snapshot.data().resetAt;
    if (!(resetAt instanceof Timestamp)) {
      onError(new Error('Data resetării punctajelor este invalidă.'));
      return;
    }
    onChange(resetAt);
  }, onError);
}
