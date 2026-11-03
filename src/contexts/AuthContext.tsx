import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { resolveRoles } from '../utils/roles';
import { COLLECTIONS, VALIDATION } from '../constants';
import { normalizeEmail, saveMemberName } from '../services/memberService';
import type { Department, UserRole } from '../models';

interface RoleState {
  uid: string | null;
  ready: boolean;
  role: UserRole | null;
  departments: Department[];
  error: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: UserRole | null;
  departments: Department[];
  isAdmin: boolean;
  isSecretary: boolean;
  roleError: string;
  retryRoles: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const [roles, setRoles] = useState<RoleState>({
    uid: null, ready: false, role: null, departments: [], error: '',
  });
  const retryRoles = useCallback(() => setRevision(value => value + 1), []);

  useEffect(() => onAuthStateChanged(auth, nextUser => {
    // Outside accounts never count as signed in, so Login stays mounted and can show why.
    if (nextUser && !normalizeEmail(nextUser.email ?? '').endsWith(VALIDATION.EMAIL_DOMAIN)) {
      void signOut(auth);
      nextUser = null;
    }
    if (nextUser?.email) {
      saveMemberName(db, nextUser.email, nextUser.displayName ?? '')
        .catch(error => console.error('Error saving member profile:', error));
    }
    setUser(nextUser);
    setAuthLoading(false);
  }), []);

  useEffect(() => {
    if (!user?.email) {
      setRoles({ uid: user?.uid ?? null, ready: true, role: null, departments: [], error: '' });
      return;
    }
    const email = normalizeEmail(user.email);
    let active = true;
    let admin: DocumentData | null | undefined;
    let secretary: DocumentData | null | undefined;
    const subscriptions: (() => void)[] = [];
    const stop = () => { active = false; subscriptions.forEach(unsubscribe => unsubscribe()); };
    const fail = (error: Error) => {
      if (!active) return;
      stop();
      console.error('Error subscribing to user roles:', error);
      setRoles({ uid: user.uid, ready: true, role: null, departments: [], error: error.message });
    };
    const publish = () => {
      if (!active || admin === undefined || secretary === undefined) return;
      try {
        const resolved = resolveRoles(admin, secretary);
        setRoles({ uid: user.uid, ready: true, role: resolved.role, departments: resolved.departments, error: '' });
      } catch (error) {
        fail(error instanceof Error ? error : new Error(String(error)));
      }
    };
    try {
      subscriptions.push(onSnapshot(doc(db, COLLECTIONS.ADMINS, email), snapshot => {
        admin = snapshot.exists() ? snapshot.data() : null;
        publish();
      }, fail));
      subscriptions.push(onSnapshot(doc(db, COLLECTIONS.SECRETARIES, email), snapshot => {
        secretary = snapshot.exists() ? snapshot.data() : null;
        publish();
      }, fail));
    } catch (error) {
      fail(error instanceof Error ? error : new Error(String(error)));
    }
    return stop;
  }, [user, revision]);

  const loading = authLoading || !roles.ready || roles.uid !== (user?.uid ?? null);
  return (
    <AuthContext.Provider value={{
      user, loading, role: roles.role, departments: roles.departments,
      isAdmin: roles.role === 'admin', isSecretary: roles.role === 'secretary',
      roleError: roles.error, retryRoles,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
