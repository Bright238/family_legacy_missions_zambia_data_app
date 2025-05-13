import { jwtDecode } from 'jwt-decode';

import axios from 'src/lib/axios';

import { JWT_STORAGE_KEY, REFRESH_TOKEN_KEY } from './constant';

// ----------------------------------------------------------------------

const isValidToken = (accessToken) => {
  if (!accessToken) {
    return false;
  }

  try {
    const decoded = jwtDecode(accessToken);

    const currentTime = Date.now() / 1000;

    const isValid = decoded.exp > currentTime;

    return isValid;
  } catch (error) {
    console.error('Error decoding token:', error);
    return false;
  }
};

// ----------------------------------------------------------------------

let tokenRefreshTimeout = null;

const scheduleTokenRefresh = (expires) => {
  if (tokenRefreshTimeout) {
    clearTimeout(tokenRefreshTimeout);
  }

  // Assume expires is in milliseconds; if it's too large, treat it as microseconds and convert
  let expiryTime = expires;
  if (expires > 9999999999999) {
    // If expires is unreasonably large, assume it's in microseconds
    expiryTime = expires / 1000000;
  }

  const currentTime = Date.now();
  const timeLeft = expiryTime - currentTime;

  if (timeLeft <= 0) {
    return;
  }

  tokenRefreshTimeout = setTimeout(async () => {
    const refreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY);

    if (refreshToken) {
      try {
        const newAccessToken = await refreshAccessToken(refreshToken);
        const newExpires = Date.now() + 3600000; // Default 1-hour expiry in milliseconds
        setSession({ accessToken: newAccessToken, refreshToken, expires: newExpires });
      } catch (error) {
        console.error('Error refreshing access token:', error);
        setSession(null);
      }
    } else {
      setSession(null);
    }
  }, timeLeft);
};

// ----------------------------------------------------------------------

const refreshAccessToken = async (refreshToken) => {
  const response = await axios.post('/auth/refresh', { refresh_token: refreshToken });

  const data = response.data.data || response.data;
  const { access_token, refresh_token, expires } = data;

  if (!access_token) {
    throw new Error('Access token not found in refresh response');
  }

  // Convert expires to milliseconds if necessary
  let newExpires = expires;
  if (expires > 9999999999999) {
    newExpires = expires / 1000000;
  } else if (!expires) {
    newExpires = Date.now() + 3600000; // Default 1-hour expiry
  }

  setSession({
    accessToken: access_token,
    refreshToken: refresh_token || refreshToken,
    expires: newExpires,
  });
  return access_token;
};

// ----------------------------------------------------------------------

const setSession = (sessionData) => {
  try {
    if (!sessionData) {
      sessionStorage.removeItem(JWT_STORAGE_KEY);
      sessionStorage.removeItem(REFRESH_TOKEN_KEY);
      sessionStorage.removeItem('expires');
      axios.defaults.headers.common.Authorization = '';
      if (tokenRefreshTimeout) {
        clearTimeout(tokenRefreshTimeout);
        tokenRefreshTimeout = null;
      }
      return;
    }

    const { accessToken, refreshToken, expires } = sessionData;

    if (accessToken) {
      sessionStorage.setItem(JWT_STORAGE_KEY, accessToken);
      axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    } else {
      sessionStorage.removeItem(JWT_STORAGE_KEY);
      axios.defaults.headers.common.Authorization = '';
    }

    if (refreshToken) {
      sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } else {
      sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    }

    if (expires) {
      sessionStorage.setItem('expires', expires.toString());
      scheduleTokenRefresh(expires);
    } else {
      sessionStorage.removeItem('expires');
    }
  } catch (error) {
    console.error('Error during set session:', error);
    throw error;
  }
};

// ----------------------------------------------------------------------

export { setSession, isValidToken, refreshAccessToken };
