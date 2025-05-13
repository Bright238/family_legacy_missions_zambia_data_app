'use client';

import { useSetState } from 'minimal-shared/hooks';
import { useMemo, useEffect, useCallback } from 'react';

import axios, { endpoints } from 'src/lib/axios';

import { AuthContext } from '../auth-context';
import { JWT_STORAGE_KEY, REFRESH_TOKEN_KEY } from './constant';
import { setSession, isValidToken, refreshAccessToken } from './utils';

// ----------------------------------------------------------------------

export function AuthProvider({ children }) {
  console.log('AuthProvider: Initializing, importing AuthContext from ../auth-context');
  const { state, setState } = useSetState({ user: null, loading: true });

  const checkUserSession = useCallback(async () => {
    // Skip sessionStorage access on server
    if (typeof window === 'undefined') {
      setState({ user: null, loading: false });
      return;
    }

    try {
      const accessToken = sessionStorage.getItem(JWT_STORAGE_KEY);
      const refreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY);

      console.log('AuthProvider: Checking user session with tokens:', {
        accessToken,
        refreshToken,
      });

      if (accessToken && isValidToken(accessToken)) {
        console.log('AuthProvider: Access token valid, setting session');
        const expires = sessionStorage.getItem('expires') || Date.now() + 3600000; // Default 1-hour expiry
        setSession({ accessToken, refreshToken, expires });

        console.log('AuthProvider: Fetching user data from:', endpoints.auth.me);
        const res = await axios.get(endpoints.auth.me);
        console.log('AuthProvider: User data response:', res.data);

        const { user } = res.data;

        setState({ user: { ...user, accessToken }, loading: false });
      } else if (refreshToken) {
        console.log('AuthProvider: Access token invalid, attempting to refresh');
        const newAccessToken = await refreshAccessToken(refreshToken);
        console.log('AuthProvider: New access token:', newAccessToken);

        const expires = Date.now() + 3600000; // Default 1-hour expiry
        setSession({ accessToken: newAccessToken, refreshToken, expires });

        console.log('AuthProvider: Fetching user data after refresh');
        const res = await axios.get(endpoints.auth.me);
        console.log('AuthProvider: User data response:', res.data);

        const { user } = res.data;

        setState({ user: { ...user, accessToken: newAccessToken }, loading: false });
      } else {
        console.log('AuthProvider: No valid tokens, setting user to null');
        setState({ user: null, loading: false });
      }
    } catch (error) {
      console.error('AuthProvider: Error checking user session:', error);
      setState({ user: null, loading: false });
    }
  }, [setState]);

  useEffect(() => {
    console.log('AuthProvider: Running useEffect to check session');
    checkUserSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----------------------------------------------------------------------

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';

  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(() => {
    const value = {
      user: state.user ? { ...state.user, role: state.user?.role ?? 'admin' } : null,
      checkUserSession,
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
    };
    console.log('AuthProvider: Providing AuthContext value:', value);
    return value;
  }, [checkUserSession, state.user, status]);

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}
