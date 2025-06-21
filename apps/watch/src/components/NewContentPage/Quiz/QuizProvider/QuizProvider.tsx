import { ReactNode, createContext, useContext, useState } from 'react'

interface Profile {
  name?: string
  tags: string[]
}

interface IQuizContext {
  history: string[]
  profile: Profile
  goTo: (slide: string) => void
  goBack: () => void
  setName: (name: string) => void
  addTags: (tags: string[]) => void
}

const QuizContext = createContext<IQuizContext | undefined>(undefined)

interface QuizProviderProps {
  startingSlide: string
  children: ReactNode
}

export function QuizProvider({ startingSlide, children }: QuizProviderProps) {
  const [profile, setProfile] = useState<Profile>({
    tags: []
  })
  const [history, setHistory] = useState<string[]>([startingSlide])

  const goTo = (slide: string) => {
    setHistory([...history, slide])
  }

  const setName = (name: string) => {
    setProfile({ ...profile, name })
  }

  const addTags = (tags: string[]) => {
    setProfile({
      ...profile,
      tags: Array.from(new Set([...profile.tags, ...tags]))
    })
  }

  const goBack = () => {
    setHistory(history.slice(0, -1))
  }

  return (
    <QuizContext.Provider
      value={{ history, profile, goTo, goBack, setName, addTags }}
    >
      {children}
    </QuizContext.Provider>
  )
}

export function useQuiz() {
  const context = useContext(QuizContext)
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider')
  }
  return context
}
