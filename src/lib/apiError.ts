import { AxiosError } from "axios";

/**
 * Extracts a user-friendly error message from an API error response.
 */
export function getApiErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data;

    // 1. Handle Top-level message (e.g. "Invalid credentials")
    if (data?.message && typeof data.message === "string" && data.message !== "Unprocessable Entity") {
      return data.message;
    }

    // 2. Handle nested error array (e.g. validation errors)
    if (Array.isArray(data?.error) && data.error.length > 0) {
      const firstError = data.error[0];
      if (typeof firstError === "string") return firstError;
      if (firstError?.message) return firstError.message;
    }

    // 3. Handle data.message if it's an array or other shape
    if (data?.message) {
      return typeof data.message === "string"
        ? data.message
        : Array.isArray(data.message)
          ? data.message[0]
          : "Something went wrong";
    }

    // 4. Handle data.error.message (older shape)
    if (data?.error?.message) {
      return typeof data.error.message === "string" ? data.error.message : "Something went wrong";
    }

    // Handle HTTP status based messages
    if (error.response?.status === 400) return "Invalid request. Please check your input.";
    if (error.response?.status === 401) return "Unauthorized. Please login again.";
    if (error.response?.status === 403) return "You don't have permission to do this.";
    if (error.response?.status === 404) return "Resource not found.";
    if (error.response?.status === 409) return "This already exists.";
    if (error.response?.status === 429) return "Too many requests. Please try again later.";
    if (error.response?.status && error.response.status >= 500) return "Server error. Please try again later.";

    // Network errors
    if (error.code === "ECONNABORTED") return "Request timed out. Please try again.";
    if (error.code === "ERR_NETWORK") return "Network error. Please check your connection.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export const TRIAL_POST_LIMIT_MESSAGE =
  "Trial limit reached. You cannot create more than 3 posts on a trial.";

export const TRIAL_DOWNLOAD_LIMIT_MESSAGE =
  "Trial limit reached. You cannot download more than 3 posts on a trial.";

/** Post create or download trial limit errors from the API */
export function isTrialLimitError(error: unknown): boolean {
  const message = getApiErrorMessage(error).toLowerCase();
  return (
    message.includes("trial limit") ||
    message.includes("more than 3 posts on a trial") ||
    message.includes("download more than 3 posts")
  );
}
