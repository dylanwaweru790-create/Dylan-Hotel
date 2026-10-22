/**
 * REST API client module demonstrating GET, POST, PUT, PATCH, and DELETE.
 * Handles HTTP requests, response parsing, and errors.
 */

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function request(endpoint, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(endpoint, config);

    if (!response.ok) {
      let errorMsg = `HTTP Error ${response.status}: ${response.statusText}`;
      let details;
      try {
        const errorData = await response.json();
        details = errorData;
        if (errorData.error) errorMsg = errorData.error;
        if (errorData.message) errorMsg = errorData.message;
      } catch {
        // Not JSON
      }
      throw new ApiError(response.status, errorMsg, details);
    }

    if (response.status === 204) {
      return {};
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, error instanceof Error ? error.message : 'Network request failed');
  }
}

export const api = {
  // HTTP GET: Retrieve data
  get: (url) => request(url, { method: 'GET' }),

  // HTTP POST: Create a new resource
  post: (url, data) =>
    request(url, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // HTTP PUT: Completely update an existing resource
  put: (url, data) =>
    request(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // HTTP PATCH: Partially update an existing resource
  patch: (url, data) =>
    request(url, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // HTTP DELETE: Delete a resource
  delete: (url) =>
    request(url, {
      method: 'DELETE',
    }),
};
