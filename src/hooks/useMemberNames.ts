import { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { subscribeToMemberNames, type MemberNames } from '../services/memberService';

export function useMemberNames(enabled = true) {
  const [names, setNames] = useState<MemberNames>(new Map());
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    if (!enabled) return;
    return subscribeToMemberNames(db, setNames, failure => {
      console.error('Error subscribing to member names:', failure);
      setError(failure.message);
    });
  }, [enabled]);

  return { names, error };
}
