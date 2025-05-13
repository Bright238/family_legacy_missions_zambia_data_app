import axios from 'axios';

import { CONFIG } from 'src/global-config';

import {
  isValidToken,
  JWT_STORAGE_KEY,
  REFRESH_TOKEN_KEY,
  refreshAccessToken,
} from 'src/auth/context/jwt';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: CONFIG.serverUrl });

// Track refresh attempts to prevent infinite loops
let refreshAttempts = 0;
const MAX_REFRESH_ATTEMPTS = 3;

axiosInstance.interceptors.request.use(
  async (config) => {
    // Check if running in browser environment
    if (typeof window === 'undefined') {
      return config; // Skip sessionStorage access on server
    }

    const accessToken = sessionStorage.getItem(JWT_STORAGE_KEY);
    const refreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY);

    if (accessToken && !isValidToken(accessToken) && refreshToken) {
      if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
        console.error('Max refresh attempts reached, clearing session');
        sessionStorage.removeItem(JWT_STORAGE_KEY);
        sessionStorage.removeItem(REFRESH_TOKEN_KEY);
        sessionStorage.removeItem('expires');
        window.location.href = '/auth/jwt/sign-in';
        return config;
      }

      console.log('Access token invalid, refreshing');
      try {
        refreshAttempts++;
        const newAccessToken = await refreshAccessToken(refreshToken);
        config.headers.Authorization = `Bearer ${newAccessToken}`;
        console.log('New access token set:', newAccessToken);
        refreshAttempts = 0; // Reset attempts on success
      } catch (error) {
        console.error('Failed to refresh token:', error);
        sessionStorage.removeItem(JWT_STORAGE_KEY);
        sessionStorage.removeItem(REFRESH_TOKEN_KEY);
        sessionStorage.removeItem('expires');
        window.location.href = '/auth/jwt/sign-in';
      }
    } else if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    console.error('Axios request interceptor error:', error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Axios response error:', {
      message: error.message,
      response: error.response
        ? {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        }
        : null,
      config: error.config,
    });
    return Promise.reject(
      error.response?.data || {
        message:
          'Something went wrong! Please check your internet connectivity and try again, or verify your username and password to ensure they are correct.',
      }
    );
  }
);

// ----------------------------------------------------------------------

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args) => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args];
    const res = await axiosInstance.get(url, { ...config });

    return res.data;
  } catch (error) {
    console.error('Failed to fetch:', error);
    throw error;
  }
};

// ----------------------------------------------------------------------

export const endpoints = {
  auth: {
    me: '/users/me',
    signIn: '/auth/login',
    signUp: '/users',
    refresh: '/auth/refresh',
    roles: '/roles',
  },
  children: {
    create: '/items/children',
    list: '/items/children',
  },
  vulnerability: {
    list: '/items/vulnerability_assessments',
    create: '/items/vulnerability_assessments',
    update: '/items/vulnerability_assessments',
    delete: '/items/vulnerability_assessments',
  },
  literacy: {
    create: '/items/literacy_assessments',
    list: '/items/literacy_assessments',
  },
  caregivers: {
    list: '/items/caregivers',
  },
  home_visits: {
    list: '/items/home_visits',
  },
};
