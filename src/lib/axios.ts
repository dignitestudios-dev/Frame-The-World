import axios from "axios";
import Cookies from "js-cookie";


//export const baseURL = "https://api.dev.frametheworld.org";
export const baseURL = "https://api.staging.frametheworld.org";
// export const baseURL = "https://b97z49q3-3050.inc1.devtunnels.ms";

const headers = {
  "Content-Type": "application/json",
};

// Helper to generate/retrieve a consistent device ID for web
function getDeviceId(): string {
  if (typeof window === "undefined") return "web-ssr";
  let deviceId = localStorage.getItem("deviceUniqueId");
  if (!deviceId) {
    deviceId = "web_" + crypto.randomUUID();
    localStorage.setItem("deviceUniqueId", deviceId);
  }
  return deviceId;
}

// Create an Axios instance
export const API = axios.create({
  baseURL: baseURL,
  timeout: 100000,
  headers: headers,
});

// Request Interceptor
API.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.authorization = `Bearer ${token}`;
    }
    // Always include device headers (required by the API)
    config.headers["devicemodel"] = "Web Browser";
    config.headers["deviceuniqueid"] = getDeviceId();
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      // Don't redirect if the request is to auth endpoints (login, signup, etc.)
      const requestUrl = error?.config?.url || "";
      const isAuthRequest = requestUrl.startsWith("/auth/");
      if (!isAuthRequest) {
        Cookies.remove("token");
        if (typeof window !== "undefined") {
          // window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);
