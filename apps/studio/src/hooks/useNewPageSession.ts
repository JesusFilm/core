import { useCallback, useEffect, useState } from 'react'

import {
  type UserInputData,
  userInputStorage
} from '../libs/storage'

type TokenUsage = {
  input: number
  output: number
}

export type SaveSessionArgs = Omit<UserInputData, 'id' | 'timestamp'>

export const useNewPageSession = () => {
  const [savedSessions, setSavedSessions] = useState<UserInputData[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [totalTokensUsed, setTotalTokensUsed] = useState<TokenUsage>({
    input: 0,
    output: 0
  })
  const [isTokensUpdated, setIsTokensUpdated] = useState(false)

  useEffect(() => {
    setSavedSessions(userInputStorage.getAllSessions())
  }, [])

  const refreshSavedSessions = useCallback(() => {
    setSavedSessions(userInputStorage.getAllSessions())
  }, [])

  const saveSession = useCallback(
    (data: SaveSessionArgs): string => {
      const sessionId = userInputStorage.saveCurrentSession(data)
      setCurrentSessionId(sessionId)
      refreshSavedSessions()
      return sessionId
    },
    [refreshSavedSessions]
  )

  const updateTokens = useCallback(
    (sessionId: string | null, usage: TokenUsage) => {
      setTotalTokensUsed((prev) => ({
        input: prev.input + usage.input,
        output: prev.output + usage.output
      }))

      if (!sessionId) {
        return
      }

      const currentSession = userInputStorage
        .getAllSessions()
        .find((session) => session.id === sessionId)
      const existingTokens = currentSession?.tokensUsed ?? { input: 0, output: 0 }

      userInputStorage.updateSession(sessionId, {
        tokensUsed: {
          input: existingTokens.input + usage.input,
          output: existingTokens.output + usage.output
        }
      })

      refreshSavedSessions()
    },
    [refreshSavedSessions]
  )

  const deleteSession = useCallback(
    (sessionId: string) => {
      userInputStorage.deleteSession(sessionId)
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null)
      }
      refreshSavedSessions()
    },
    [currentSessionId, refreshSavedSessions]
  )

  return {
    savedSessions,
    refreshSavedSessions,
    currentSessionId,
    setCurrentSessionId,
    totalTokensUsed,
    setTotalTokensUsed,
    isTokensUpdated,
    setIsTokensUpdated,
    saveSession,
    updateTokens,
    deleteSession
  }
}

export type UseNewPageSessionReturn = ReturnType<typeof useNewPageSession>
