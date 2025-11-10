'use client'

import { FirebaseError, signInWithEmailAndPassword } from 'firebase/auth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useState } from 'react'

import { loginWithCredential } from '@/app/api'
import {
  getFirebaseAuth,
  loginWithFacebook,
  loginWithGoogle
} from '@/libs/auth/firebase'
import { useAuth } from '@/libs/auth/authContext'
import { getFirebaseErrorMessage } from '@/libs/auth/getFirebaseErrorMessage'
import { useRedirectAfterLogin } from '@/libs/auth/useRedirectAfterLogin'

export default function SignInPage() {
  const t = useTranslations('SignInPage')
  const tErrors = useTranslations('errors')
  const { user } = useAuth()
  const router = useRouter()
  const [hasLogged, setHasLogged] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isEmailLoading, setIsEmailLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isFacebookLoading, setIsFacebookLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const redirectAfterLogin = useRedirectAfterLogin()

  useEffect(() => {
    if (user != null) {
      router.push('/')
    }
  }, [user, router])

  const handleLogin = useCallback(
    async function (
      credential: Awaited<ReturnType<typeof loginWithGoogle>>
    ): Promise<void> {
      await loginWithCredential(credential)
      redirectAfterLogin()
    },
    [redirectAfterLogin]
  )

  const handleLoginWithEmailAndPassword = useCallback(
    async function (e: React.FormEvent) {
      e.preventDefault()
      setError(null)
      setIsEmailLoading(true)
      setHasLogged(false)

      try {
        const auth = getFirebaseAuth()
        const credential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        )

        await handleLogin(credential)
        setHasLogged(true)
      } catch (err) {
        const firebaseError = err as FirebaseError
        setError(getFirebaseErrorMessage(firebaseError, tErrors))
        setIsEmailLoading(false)
      }
    },
    [email, password, handleLogin, tErrors]
  )

  const handleLoginWithGoogle = useCallback(async () => {
    setError(null)
    setIsGoogleLoading(true)
    setHasLogged(false)

    try {
      const auth = getFirebaseAuth()
      await handleLogin(await loginWithGoogle(auth))
      setHasLogged(true)
    } catch (err) {
      const firebaseError = err as FirebaseError
      setError(getFirebaseErrorMessage(firebaseError, tErrors))
      setIsGoogleLoading(false)
    }
  }, [handleLogin, tErrors])

  const handleLoginWithFacebook = useCallback(async () => {
    setError(null)
    setIsFacebookLoading(true)
    setHasLogged(false)

    try {
      const auth = getFirebaseAuth()
      await handleLogin(await loginWithFacebook(auth))
      setHasLogged(true)
    } catch (err) {
      const firebaseError = err as FirebaseError
      setError(getFirebaseErrorMessage(firebaseError, tErrors))
      setIsFacebookLoading(false)
    }
  }, [handleLogin, tErrors])

  if (user != null) {
    return null
  }

  if (hasLogged) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="border-t-primary-500 h-8 w-8 animate-spin rounded-full border-4 border-gray-300"></div>
          <p className="text-gray-600">{t('signingIn')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex w-full flex-col lg:flex-row">
        <div className="flex w-full flex-col justify-center bg-white px-8 py-12 lg:w-2/5">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-12 flex items-center gap-2">
              <div className="bg-primary-500 flex h-10 w-10 items-center justify-center rounded-lg">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">Lumina AI</span>
            </div>

            <div className="mb-8">
              <h1 className="mb-2 text-3xl font-bold text-gray-900">
                {t('title')}
              </h1>
              <p className="text-sm text-gray-600">{t('description')}</p>
            </div>

            <form
              onSubmit={handleLoginWithEmailAndPassword}
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  {t('emailLabel')}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-1 focus:outline-none"
                  placeholder={t('emailPlaceholder')}
                  disabled={
                    isEmailLoading || isGoogleLoading || isFacebookLoading
                  }
                />
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {t('passwordLabel')}
                  </label>
                  <Link
                    href="#"
                    className="text-primary-500 hover:text-primary-600 text-sm"
                  >
                    {t('forgotPassword')}
                  </Link>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-1 focus:outline-none"
                  placeholder={t('passwordPlaceholder')}
                  disabled={
                    isEmailLoading || isGoogleLoading || isFacebookLoading
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="text-primary-500 focus:ring-primary-500 h-4 w-4 rounded border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {t('rememberMe')}
                  </span>
                </label>
              </div>

              {error != null && (
                <div className="rounded-lg bg-red-50 p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={
                  isEmailLoading || isGoogleLoading || isFacebookLoading
                }
                className="bg-primary-500 hover:bg-primary-600 focus:ring-primary-500 w-full rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isEmailLoading ? (
                  <span className="flex items-center justify-center">
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    {t('signingIn')}
                  </span>
                ) : (
                  t('signInButton')
                )}
              </button>
            </form>

            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-sm text-gray-500">{t('or')}</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleLoginWithGoogle}
                disabled={
                  isEmailLoading || isGoogleLoading || isFacebookLoading
                }
                className="focus:ring-primary-500 flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isGoogleLoading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"></span>
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                <span>{t('signInWithGoogle')}</span>
              </button>

              <button
                type="button"
                onClick={handleLoginWithFacebook}
                disabled={
                  isEmailLoading || isGoogleLoading || isFacebookLoading
                }
                className="focus:ring-primary-500 flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isFacebookLoading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"></span>
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                )}
                <span>{t('signInWithFacebook')}</span>
              </button>
            </div>

            <div className="mt-6 text-center text-sm text-gray-600">
              <span>{t('switchToSignUp')} </span>
              <Link
                href="/users/sign-up"
                className="text-primary-500 hover:text-primary-600 font-medium"
              >
                {t('switchToSignUpLink')}
              </Link>
            </div>

            <div className="mt-8 flex items-center justify-between text-xs text-gray-500">
              <span>{t('copyright', { year: new Date().getFullYear() })}</span>
              <Link
                href="https://www.jesusfilm.org/privacy/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-700"
              >
                {t('privacyPolicy')}
              </Link>
            </div>
          </div>
        </div>

        <div className="texture-orange-gradient hidden flex-col justify-center px-12 py-12 lg:flex lg:w-3/5">
          <div className="relative z-10 max-w-lg">
            <h2 className="mb-6 text-4xl leading-tight font-bold text-white">
              {t('promoTitle')}
            </h2>
            <p className="text-primary-100 mb-12 text-lg leading-relaxed">
              {t('promoDescription')}
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="mb-1 text-xl font-semibold text-white">
                    {t('promoFeature1')}
                  </h3>
                  <p className="text-primary-100">{t('promoFeature1Desc')}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="mb-1 text-xl font-semibold text-white">
                    {t('promoFeature2')}
                  </h3>
                  <p className="text-primary-100">{t('promoFeature2Desc')}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="mb-1 text-xl font-semibold text-white">
                    {t('promoFeature3')}
                  </h3>
                  <p className="text-primary-100">{t('promoFeature3Desc')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
