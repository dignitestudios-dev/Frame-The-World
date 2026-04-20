import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PostState {
    postDetails: any | null;
    setPostDetails: (postDetails: any) => void;
}

export const usePostStore = create<PostState>()(
    persist(
        (set) => ({
            postDetails: null,
            setPostDetails: (postDetails: any) => set({ postDetails }),
        }),
        {
            name: "post-storage",
        }
    )
);
