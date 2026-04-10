import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";

interface User {
  id: string;
  name?: string;
  email: string;
  profilePicture?: any;
  bio?: string;
  role?: string;
  company?: any;
  isProfileCompleted?: boolean;
  isVerified?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isGuest: boolean;

  // Temp state for auth flows
  authEmail: string | null;
  resetToken: string | null;
  otpMode: "signup" | "reset" | null;
  tempProfileData: any | null;

  // Actions
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  setAuthEmail: (email: string) => void;
  setResetToken: (token: string) => void;
  setOtpMode: (mode: "signup" | "reset" | null) => void;
  setTempProfileData: (data: any) => void;
  setGuest: (isGuest: boolean) => void;
  login: (data: { user: User; token: string }) => void;
  updateUser: (userData: Partial<User>) => void;
  logout: () => void;
  clearAuthFlow: () => void;
}


export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isGuest: false,
      _hasHydrated: false,
      authEmail: null,
      resetToken: null,
      otpMode: null,
      tempProfileData: null,

      setHasHydrated: (state) => set({ _hasHydrated: state }),
      setAuthEmail: (email) => set({ authEmail: email }),
      setResetToken: (token) => set({ resetToken: token }),
      setOtpMode: (mode) => set({ otpMode: mode }),
      setTempProfileData: (data) => set({ tempProfileData: data }),
      setGuest: (isGuest) => {
        if (isGuest) {
          Cookies.set("isGuest", "true", { expires: 7 });
        } else {
          Cookies.remove("isGuest");
        }
        set({ isGuest });
      },

      login: (data) => {
        Cookies.set("token", data.token, { expires: 7 });
        Cookies.set("isProfileCompleted", String(data.user.isProfileCompleted), { expires: 7 });
        set({ user: data.user, token: data.token, isGuest: false });
      },

      updateUser: (userData) =>

        set((state) => {
          console.log(userData)
          if (userData.isProfileCompleted) {
            Cookies.set("isProfileCompleted", String(userData.isProfileCompleted), { expires: 7 });
          }
          return {
            user: state.user ? { ...state.user, ...userData } : null,
          };
        }),

      logout: () => {
        Cookies.remove("token");
        Cookies.remove("isGuest");
        Cookies.remove("isProfileCompleted");
        set({
          user: null,
          token: null,
          isGuest: false,
          authEmail: null,
          resetToken: null,
          otpMode: null,
          tempProfileData: null,
        });
      },

      clearAuthFlow: () =>
        set({
          authEmail: null,
          resetToken: null,
          otpMode: null,
          tempProfileData: null,
        }),

    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);