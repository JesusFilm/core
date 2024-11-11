import { create } from 'zustand'

export const useStore = create((set) => ({
  showDrawer: false,
  activeDrawerContent: null,
  actions: {
    openDrawer: () => set((state) => ({ ...state, showDrawer: true })),
    closeDrawer: () => set((state) => ({ ...state, showDrawer: false })),
    toggleDrawer: () => set((state) => ({ ...state, showDrawer: !state.showDrawer }))
  }
}))