import { useMemo } from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../ui/dialog'

import { SignInButton } from './SignInButton'

export type AuthRequirementReason =
  | 'attachment'
  | 'limit'
  | 'media'
  | 'unsplash'

type AuthRequiredDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  reason: AuthRequirementReason
  message?: string
  remaining?: number
  onSignInSuccess: () => Promise<void> | void
}

// Auth UX V4 enhancement
const getDialogCopy = (
  reason: AuthRequirementReason,
  message?: string,
  remaining?: number
) => {
  if (message) {
    return {
      title:
        reason === 'attachment'
          ? 'Sign in to add images'
          : reason === 'media' || reason === 'unsplash'
            ? 'Unlock media tools'
            : 'Sign in for higher daily limits',
      description: message
    }
  }

  switch (reason) {
    case 'attachment':
      return {
        title: 'Sign in to add images',
        description:
          'Image uploads, camera capture, and AI analysis are only available after signing in with Google.'
      }
    case 'media':
    case 'unsplash':
      return {
        title: 'Unlock media tools',
        description:
          'Sign in with Google to explore Unsplash results and save media preferences for your projects.'
      }
    case 'limit':
    default: {
      const hasRemaining = remaining != null && Number.isFinite(remaining) && remaining > 0
      const remainingLabel = remaining === 1 ? 'prompt' : 'prompts'
      return {
        title: 'Sign in for higher daily limits',
        description: hasRemaining
          ? `Only ${remaining} ${remainingLabel} remain before Google sign-in is required.`
          : 'Guests can run up to five prompts per day. Sign in with Google to keep creating without interruption.'
      }
    }
  }
}

// Auth UX V4 enhancement
export function AuthRequiredDialog({
  open,
  onOpenChange,
  reason,
  message,
  remaining,
  onSignInSuccess
}: AuthRequiredDialogProps) {
  const { title, description } = useMemo(
    () => getDialogCopy(reason, message, remaining),
    [message, reason, remaining]
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <SignInButton
            className="w-full"
            variant="secondary"
            afterSignIn={() => onSignInSuccess()}
            onError={() => {
              console.warn('Google sign-in was cancelled or failed.')
            }}
          >
            Continue with Google
          </SignInButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
