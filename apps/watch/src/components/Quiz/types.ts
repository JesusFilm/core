import { ReactNode } from 'react'

export interface Profile {
  name?: string
  tags: string[]
}

export interface SlideContext {
  profile: Profile
  setName: (name: string) => void
  addTags: (tags: string[]) => void
  goTo: (slideId: string) => void
  t: (key: string) => string
}

export interface SlideDefinition {
  id: string
  render: (ctx: SlideContext) => ReactNode
}

export interface QuizModalProps {
  isOpen: boolean
  onClose: () => void
  startSlideId?: string
}

export interface QuizOption {
  key: string
  next: string
  tags: string[]
  label: string
}
