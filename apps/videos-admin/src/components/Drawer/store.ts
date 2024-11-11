import { ReactNode } from "react";
import { create } from "zustand";

type State = {
  open: boolean
  title: string
  content: null | ReactNode
}

interface OpenDrawerAction {
  title: State['title']
  content: State['content']
}

type Action = {
  openDrawer: (state: OpenDrawerAction) => void
  closeDrawer: () => void
}

export const useDrawerStore = create<State & Action>((set) => ({
  open: false,
  title: 'Drawer',
  content: null,
  openDrawer: ({ title, content }) => set({ open: true, title, content }),
  closeDrawer: () => set({ open: false, content: null })
}))