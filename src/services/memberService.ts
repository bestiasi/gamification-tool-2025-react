import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import type { Firestore, Unsubscribe } from 'firebase/firestore';
import { COLLECTIONS } from '../constants/index.ts';

export type MemberNames = ReadonlyMap<string, string>;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function displayName(names: MemberNames, email: string): string {
  return names.get(email) ?? email.split('@')[0];
}

// members/{email} is the only place a person's display name is stored.
export function saveMemberName(database: Firestore, email: string, name: string): Promise<void> {
  const trimmed = name.trim().slice(0, 100) || email.split('@')[0];
  return setDoc(doc(database, COLLECTIONS.MEMBERS, normalizeEmail(email)), { name: trimmed });
}

export function subscribeToMemberNames(
  database: Firestore,
  onChange: (names: MemberNames) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(collection(database, COLLECTIONS.MEMBERS), snapshot => {
    onChange(new Map(snapshot.docs.flatMap(document => {
      const name = document.data().name;
      return typeof name === 'string' && name.trim() ? [[document.id, name] as const] : [];
    })));
  }, onError);
}
