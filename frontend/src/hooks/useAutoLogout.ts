import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

// ═══ ISO 27001 A.11.2.8: Session timeout after inactivity ═══
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export function useAutoLogout() {
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const handleLogout = useCallback(() => {
    // Try to log the logout event
    api.post('/auth/logout').catch(() => {});
    logout();
    window.location.href = '/login';
  }, [logout]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (token) {
      timerRef.current = setTimeout(handleLogout, INACTIVITY_TIMEOUT_MS);
    }
  }, [token, handleLogout]);

  useEffect(() => {
    if (!token) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [token, resetTimer]);
}
