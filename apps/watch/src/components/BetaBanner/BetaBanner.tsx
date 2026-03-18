'use client'

import { useTranslation } from 'next-i18next'
import { type ReactElement } from 'react'

const EXPERIMENTAL_COOKIE_NAME = 'EXPERIMENTAL'

function deleteExperimentalCookie(): void {
  if (typeof document === 'undefined') return
  document.cookie = `${EXPERIMENTAL_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
  if (typeof window !== 'undefined') window.location.reload()
}

export function BetaBanner(): ReactElement {
  const { t } = useTranslation('apps-watch')

  return (
    <section
      role="banner"
      className="relative z-100 w-full bg-[#000] text-white shadow-sm transition-colors hover:bg-[#ce2e37]"
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-center px-4 py-3">
        <div className="inline-flex w-full flex-wrap items-center justify-center gap-2 rounded-md text-center text-sm leading-tight font-semibold tracking-wide text-white">
          <span aria-hidden>✨</span>
          <span className="hidden sm:inline">
            {t("This is a new experience we're testing.")}
          </span>
          <a
            href="https://forms.gle/8WddM1kuyEBznukW8"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-white/50 underline-offset-4 transition-all duration-500 hover:decoration-white"
          >
            {t('Your feedback helps.')}
          </a>
          <span aria-hidden>→</span>
          <a
            className="cursor-pointer underline decoration-white/50 underline-offset-4 transition-all duration-500 hover:decoration-white"
            onClick={deleteExperimentalCookie}
          >
            {t('Switch to classic experience')}
          </a>
        </div>
      </div>
    </section>
  )
}
