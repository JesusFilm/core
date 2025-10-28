import { Loader2 } from 'lucide-react'
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { useRouter } from 'next/router'
import { useCallback, useState, type ReactNode } from 'react'

import { Button } from '../ui/button'

type SignInButtonProps = {
  className?: string
  children?: ReactNode
  size?: 'default' | 'sm' | 'lg' | 'icon'
  variant?: 'default' | 'secondary' | 'ghost' | 'outline'
  afterSignIn?: () => Promise<void> | void
  onError?: (error: unknown) => void
}

export function SignInButton({
  className,
  children,
  size = 'default',
  variant = 'default',
  afterSignIn,
  onError
}: SignInButtonProps) {
  const router = useRouter()
  const [isSigningIn, setIsSigningIn] = useState(false)

  const handleSignIn = useCallback(async () => {
    if (isSigningIn) return

    setIsSigningIn(true)
    try {
      const auth = getAuth()
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: 'select_account' })
      await signInWithPopup(auth, provider)
      await afterSignIn?.()
    } catch (error) {
      console.error('Failed to sign in with Google.', error)
      onError?.(error)
      if (router.isFallback) {
        console.warn('Router is in fallback mode during sign-in; state may not update immediately.')
      }
    } finally {
      setIsSigningIn(false)
    }
  }, [afterSignIn, isSigningIn, onError, router.isFallback])

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={() => void handleSignIn()}
      disabled={isSigningIn}
    >
      {isSigningIn ? (
        <span className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Signing in…</span>
        </span>
      ) : (
        children ?? 'Continue with Google'
      )}
    </Button>
  )
}
