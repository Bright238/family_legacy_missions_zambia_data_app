'use client';

import axios, { endpoints } from 'src/lib/axios';

import { setSession } from './utils';

/** **************************************
 * Sign in
 *************************************** */
export const signInWithPassword = async ({ email, password }) => {
  try {
    const params = { email, password };

    const res = await axios.post(endpoints.auth.signIn, params);

    const { access_token, refresh_token, expires } = res.data.data;

    if (!access_token || !refresh_token) {
      throw new Error('Access or refresh token not found in response');
    }

    // Convert expires to milliseconds if necessary
    let adjustedExpires = expires;
    if (expires > 9999999999999) {
      adjustedExpires = expires / 1000000;
    }

    setSession({
      accessToken: access_token,
      refreshToken: refresh_token,
      expires: adjustedExpires,
    });
  } catch (error) {
    console.error('Error during sign in:', error);
    throw error;
  }
};

/** **************************************
 * Sign up
 *************************************** */
export const signUp = async ({ email, password, firstName, lastName }) => {
  const params = {
    email,
    password,
    first_name: firstName,
    last_name: lastName,
  };

  try {
    const res = await axios.post(endpoints.auth.signUp, params);

    const { access_token, refresh_token, expires } = res.data.data;

    if (!access_token) {
      throw new Error('Access token not found in response');
    }

    // Convert expires to milliseconds if necessary
    let adjustedExpires = expires;
    if (expires > 9999999999999) {
      adjustedExpires = expires / 1000000;
    }

    setSession({
      accessToken: access_token,
      refreshToken: refresh_token,
      expires: adjustedExpires,
    });
  } catch (error) {
    console.error('Error during sign up:', error);
    throw error;
  }
};

/** **************************************
 * Sign out
 *************************************** */
export const signOut = async () => {
  try {
    await setSession(null);
  } catch (error) {
    console.error('Error during sign out:', error);
    throw error;
  }
};
