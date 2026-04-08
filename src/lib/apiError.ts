import { AxiosError } from "axios";

/**
 * Extracts a user-friendly error message from an API error response.
 */
export function getApiErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data;

    // Handle common API error response shapes
    if (data?.message) {
      return typeof data.message === "string"
        ? data.message
        : Array.isArray(data.message)
        ? data.message[0]
        : "Something went wrong";
    }

    if (data?.error) {
      return typeof data.error === "string" ? data.error : "Something went wrong";
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
