import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import * as slideModules from './slides'
import { Profile, SlideContext, SlideDefinition } from './types'

export function useQuizEngine(startId: string) {
  const { t } = useTranslation()
  const slidesMap = useMemo(() => {
    const m: Record<string, SlideDefinition> = {}
    Object.values(slideModules).forEach((s) => {
      m[s.id] = s as SlideDefinition
    })
    return m
  }, [])

  const [current, setCurrent] = useState(startId)
  const [profile, setProfile] = useState<Profile>({ tags: [] })

  const ctx: SlideContext = {
    profile,
    setName: (name: string) => setProfile((p) => ({ ...p, name })),
    addTags: (tags: string[]) =>
      setProfile((p) => ({
        ...p,
        tags: Array.from(new Set([...p.tags, ...tags]))
      })),
    goTo: (slideId: string) => {
      if (!document.startViewTransition) {
        setCurrent(slideId)
        return
      }

      document.startViewTransition(() => {
        setCurrent(slideId)
      })
    },
    t: (key: string) => t(key)
  }

  const Slide = slidesMap[current]
  return { Slide, ctx, profile }
}
