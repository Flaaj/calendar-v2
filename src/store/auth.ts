import { User } from "firebase/auth";
import create from "zustand";
import { immer } from "zustand/middleware/immer";

interface AuthState  {
    isSignedIn: boolean | null;
    user: User | null;
    signedIn: (user: User) => void;
    signedOut: () => void;
};

export const useAuthStore = create(immer<AuthState>((set) => ({
    isSignedIn: null,
    user: null,
    signedIn: (user) =>
        set((state) => {
            state.isSignedIn = true;
            state.user = user;
        }),
    signedOut: () =>
        set((state) => {
            state.isSignedIn = false;
            state.user = null;
        }),
})));
