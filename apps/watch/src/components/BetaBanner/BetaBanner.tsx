'use client'

import { useTranslation } from 'next-i18next'
import { type KeyboardEvent, type ReactElement, useEffect, useState } from 'react'

const EXPERIMENTAL_COOKIE_NAME = 'EXPERIMENTAL'
const MOBILE_MEDIA_QUERY = '(max-width: 768px)'

function deleteExperimentalCookie(): void {
  if (typeof document === 'undefined') return
  document.cookie = `${EXPERIMENTAL_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
  if (typeof window !== 'undefined') window.location.reload()
}

export function BetaBanner(): ReactElement {
  const { t } = useTranslation('apps-watch')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined')
      return

    const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY)
    const updateIsMobile = (): void => setIsMobile(mediaQuery.matches)

    updateIsMobile()

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updateIsMobile)
      return () => mediaQuery.removeEventListener('change', updateIsMobile)
    }

    if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(updateIsMobile)
      return () => mediaQuery.removeListener(updateIsMobile)
    }

    return undefined
  }, [])

  return (
    <section
      role="banner"
      className="w-full bg-[#000] text-white shadow-sm transition-colors hover:bg-[#ce2e37] relative z-100"
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-center px-4 py-3">
        <div className="inline-flex w-full flex-wrap items-center justify-center gap-2 rounded-md text-center text-sm font-semibold leading-tight tracking-wide text-white">
          <span aria-hidden className="text-sm">
            ✨
          </span>
          <span className="text-balance text-sm font-semibold">
            {isMobile
              ? <><span className="hidden sm:inline">{t('This is beta.')} </span><a href="https://forms.gle/8WddM1kuyEBznukW8" target="_blank" rel="noopener noreferrer" className="underline decoration-white/70 underline-offset-4 hover:decoration-white">{t('Give feedback.')}</a></>
              : <>{t('This is a beta experience.')} <a href="https://forms.gle/8WddM1kuyEBznukW8" target="_blank" rel="noopener noreferrer" className="underline decoration-white/70 underline-offset-4 hover:decoration-white">{t('Your feedback helps.')}</a></>}
          </span>
          <span aria-hidden className="px-2 text-base">
            →
          </span>
          <span
            className="text-sm font-bold underline decoration-white/70 underline-offset-4 cursor-pointer"
            onClick={deleteExperimentalCookie}
          >
            {isMobile ? t('Back to stable') : t('Back to stable')}
          </span>
        </div>
      </div>
    </section>
  )
}
