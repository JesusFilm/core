import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

import { SignInButton } from '../../src/components/auth/SignInButton'
import { useAuthUser } from '../../src/hooks/useAuthUser'
import { useRedirectAfterLogin } from '../../src/hooks/useRedirectAfterLogin'

export default function SignInPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthUser()
  const redirectAfterLogin = useRedirectAfterLogin()

  useEffect(() => {
    if (isAuthenticated) {
      void redirectAfterLogin()
    }
  }, [isAuthenticated, redirectAfterLogin])

  return (
    <>
      <Head>
        <title>Sign in | WatchModern Studio</title>
      </Head>
      <main className="flex min-h-screen items-center justify-center bg-stone-100 px-4 py-16">
        <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-2xl">
          <div className="space-y-4 text-center">
            <h1 className="text-2xl font-semibold text-foreground">
              Sign in to WatchModern Studio
            </h1>
            <p className="text-sm text-muted-foreground">
              Use your Google account to unlock media uploads, AI image analysis, and higher daily prompt limits.
            </p>
          </div>
          <div className="mt-8 space-y-4">
            <SignInButton
              className="w-full"
              afterSignIn={() => redirectAfterLogin()}
            >
              Continue with Google
            </SignInButton>
            <p className="text-sm text-muted-foreground">
              Prefer to explore without signing in?{' '}
              <button
                className="text-primary underline-offset-4 hover:underline"
                type="button"
                onClick={() => {
                  void router.push('/studio/new')
                }}
              >
                Return to the studio
              </button>
            </p>
            <p className="text-xs text-muted-foreground">
              By continuing, you agree to our{' '}
              <Link
                href="https://www.jesusfilm.org/terms-of-use"
                className="text-primary underline-offset-4 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms of Use
              </Link>{' '}
              and{' '}
              <Link
                href="https://www.jesusfilm.org/privacy"
                className="text-primary underline-offset-4 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
