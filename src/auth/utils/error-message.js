// utils/getErrorMessage.js
export function getErrorMessage(error) {
  // Handle network errors (e.g., no internet)
  if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
    return 'No internet connection. Please check your network and try again.';
  }

  // Handle Axios or Fetch HTTP response errors
  if (error.response) {
    const { status, data } = error.response;
    if (status === 401) {
      return 'Invalid email or password. Please try again.';
    }
    if (status === 400) {
      return data.message || 'Invalid request. Please check your input.';
    }
    if (status === 403) {
      return 'Access denied. Please contact support.';
    }
    if (status >= 500) {
      return 'Server error. Please try again later.';
    }
    // Fallback for other HTTP errors
    return (
      data.message ||
      'Please verify your login email and password if they are correct or check your internet connectivity.'
    );
  }

  // Handle JavaScript Error instances
  if (error instanceof Error) {
    return (
      error.message ||
      error.name ||
      'Please verify your login email and password if they are correct or check your internet connectivity.'
    );
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Handle generic objects with a message property
  if (typeof error === 'object' && error !== null) {
    const errorMessage = error.message || error.error;
    if (typeof errorMessage === 'string') {
      return errorMessage;
    }
  }

  // Fallback for unknown errors
  return 'Please verify your login email and password if they are correct or check your internet connectivity.';
}
