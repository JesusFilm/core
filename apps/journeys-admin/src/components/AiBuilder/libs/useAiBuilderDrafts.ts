import { useCallback, useEffect, useState } from 'react'

import { type AiBuilderDraft, createDraft } from './aiBuilderDraft'

export const DRAFTS_STORAGE_KEY = 'journeys-admin:ai-builder-drafts'

function readDrafts(): AiBuilderDraft[] {
  try {
    const raw = window.localStorage.getItem(DRAFTS_STORAGE_KEY)
    if (raw == null) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as AiBuilderDraft[]) : []
  } catch {
    return []
  }
}

function writeDrafts(drafts: AiBuilderDraft[]): void {
  try {
    window.localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts))
  } catch {
    // Storage full or blocked: the drafts still work for this visit.
  }
}

interface UseAiBuilderDrafts {
  drafts: AiBuilderDraft[]
  activeDraft: AiBuilderDraft | null
  selectDraft: (id: string) => void
  /** Creates, selects and returns a new empty draft. */
  newDraft: () => AiBuilderDraft
  deleteDraft: (id: string) => void
  updateDraft: (
    id: string,
    update: (draft: AiBuilderDraft) => AiBuilderDraft
  ) => void
}

/**
 * Chunk 1 keeps drafts (chat + journey JSON) in this browser's localStorage.
 * Chunk 3 replaces this with saved journeys.
 */
export function useAiBuilderDrafts(): UseAiBuilderDrafts {
  const [drafts, setDrafts] = useState<AiBuilderDraft[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  // localStorage is browser-only, so read it after the first render.
  useEffect(() => {
    const stored = readDrafts()
    setDrafts(stored)
    setActiveId(stored[0]?.id ?? null)
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (loaded) writeDrafts(drafts)
  }, [drafts, loaded])

  const newDraft = useCallback(() => {
    const draft = createDraft()
    setDrafts((current) => [draft, ...current])
    setActiveId(draft.id)
    return draft
  }, [])

  const deleteDraft = useCallback((id: string) => {
    setDrafts((current) => current.filter((draft) => draft.id !== id))
    setActiveId((current) => (current === id ? null : current))
  }, [])

  const updateDraft = useCallback(
    (id: string, update: (draft: AiBuilderDraft) => AiBuilderDraft) => {
      setDrafts((current) =>
        current.map((draft) => (draft.id === id ? update(draft) : draft))
      )
    },
    []
  )

  return {
    drafts,
    activeDraft: drafts.find((draft) => draft.id === activeId) ?? null,
    selectDraft: setActiveId,
    newDraft,
    deleteDraft,
    updateDraft
  }
}
