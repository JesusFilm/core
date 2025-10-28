import { useCallback, useRef, useState } from 'react'

import type { AuthRequirementReason } from '../components/auth/AuthRequiredDialog'

type AuthDialogState = {
  reason: AuthRequirementReason
  message?: string
  remaining?: number
}

type RequestAuthOptions = AuthDialogState & {
  resumeAction?: () => Promise<void> | void
}

type UseAuthRequiredDialogOptions = {
  onSignedIn?: () => Promise<void> | void
}

type UseAuthRequiredDialogReturn = {
  dialogState: AuthDialogState | null
  isOpen: boolean
  requestAuth: (options: RequestAuthOptions) => void
  onOpenChange: (open: boolean) => void
  onSignInSuccess: () => Promise<void>
  resumeRequested: boolean
  runPendingAction: () => Promise<void>
}

// Auth UX V4 enhancement
export function useAuthRequiredDialog({
  onSignedIn
}: UseAuthRequiredDialogOptions = {}): UseAuthRequiredDialogReturn {
  const [dialogState, setDialogState] = useState<AuthDialogState | null>(null)
  const pendingActionRef = useRef<(() => Promise<void> | void) | null>(null)
  const [resumeRequested, setResumeRequested] = useState(false)

  const requestAuth = useCallback((options: RequestAuthOptions) => {
    pendingActionRef.current = options.resumeAction ?? null
    setDialogState({
      reason: options.reason,
      message: options.message,
      remaining: options.remaining
    })
  }, [])

  const onOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setDialogState(null)
      pendingActionRef.current = null
      setResumeRequested(false)
    }
  }, [])

  const onSignInSuccess = useCallback(async () => {
    setDialogState(null)
    setResumeRequested(true)
    if (onSignedIn) {
      await onSignedIn()
    }
  }, [onSignedIn])

  const runPendingAction = useCallback(async () => {
    const action = pendingActionRef.current
    pendingActionRef.current = null
    setResumeRequested(false)
    if (action) {
      await action()
    }
  }, [])

  return {
    dialogState,
    isOpen: dialogState != null,
    requestAuth,
    onOpenChange,
    onSignInSuccess,
    resumeRequested,
    runPendingAction
  }
}
