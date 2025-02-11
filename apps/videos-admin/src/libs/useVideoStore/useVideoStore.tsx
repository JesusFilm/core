import { create } from 'zustand'

import { GetAdminVideo_AdminVideo as AdminVideo } from '../../libs/useAdminVideo/useAdminVideo'

interface VideoState {
  video: AdminVideo | null
  setVideo: (video: AdminVideo) => void
  clearVideo: () => void
}

export const useVideoStore = create<VideoState>((set) => ({
  video: null,
  setVideo: (video) => set({ video }),
  clearVideo: () => set({ video: null })
}))
