import { Globe, Mail } from 'lucide-react'
import Image from 'next/image'
import NextLink from 'next/link'
import { ReactElement, useMemo, useState } from 'react'

import { Button } from '@core/shared/uimodern/components'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '../../../Dialog'

const LANGUAGES = [
  { code: 'en', name: 'English', urlName: 'english' },
  { code: 'fr', name: 'Français', urlName: 'french' },
  { code: 'es', name: 'Español', urlName: 'spanish-latin-american' },
  { code: 'pt', name: 'Português', urlName: 'portuguese-brazil' },
  { code: 'ru', name: 'Русский', urlName: 'russian' }
]

interface CollectionsHeaderProps {
  feedbackButtonLabel: string
  languageSlug?: string
}

export function CollectionsHeader({
  feedbackButtonLabel,
  languageSlug
}: CollectionsHeaderProps): ReactElement {
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false)

  const homeHref = useMemo(() => {
    if (languageSlug != null && languageSlug !== 'english') {
      return `/watch/${languageSlug}`
    }
    return '/watch'
  }, [languageSlug])

  return (
    <>
      <div
        data-testid="CollectionsHeader"
        className="absolute top-0 left-0 right-0 w-full h-[100px] lg:h-[200px] max-w-[1920px] mx-auto z-[99] flex items-center justify-between padded"
      >
        <NextLink href={homeHref} locale={false}>
          <Image
            src="/assets/jesusfilm-sign.svg"
            alt="JesusFilm Project"
            width={70}
            height={70}
            className="max-w-[50px] lg:max-w-[70px]"
          />
        </NextLink>
        <Button
          data-testid="LanguageButton"
          onClick={() => setIsLanguageModalOpen(true)}
          aria-label="select language"
          tabIndex={0}
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
        >
          <Globe className="h-5 w-5" />
        </Button>
      </div>
      <Dialog open={isLanguageModalOpen} onOpenChange={setIsLanguageModalOpen}>
        <DialogContent className="max-w-xl border border-white/10 bg-black/80 text-white">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-semibold">
              Select a language
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            {LANGUAGES.map((language) => (
              <NextLink
                href={`/watch/easter/${language.urlName}`}
                key={language.code}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/5 px-4 py-3 text-sm font-semibold uppercase tracking-widest transition-colors hover:bg-white/10"
                data-testid={`language-button-${language.code}`}
              >
                {language.name}
              </NextLink>
            ))}
            <NextLink
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-3 text-sm font-semibold tracking-wide transition-colors hover:bg-white/5"
              data-testid="language-button-support"
            >
              <Mail className="h-4 w-4" />
              {feedbackButtonLabel}
            </NextLink>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
