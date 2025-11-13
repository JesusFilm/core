import { Share2 } from 'lucide-react'
import Image from 'next/image'
import last from 'lodash/last'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import { Button, ExtendedButton } from '@core/shared/uimodern'

import { getLabelDetails } from '../../libs/utils/getLabelDetails/getLabelDetails'
import { useVideoChildren } from '../../libs/useVideoChildren'
import { useVideo } from '../../libs/videoContext'
import { ContentHeader } from '../ContentHeader'
import { ContentPageBlurFilter } from '../ContentPageBlurFilter'
import { DialogShare } from '../DialogShare'
import { VideoGrid } from '../VideoGrid'

import { AudioLanguageSelect } from './AudioLanguageSelect'

export function PageVideoContainer(): ReactElement {
  const { locale } = useRouter()
  const { t } = useTranslation('apps-watch')
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const { snippet, slug, variant, images, title, label, childrenCount } =
    useVideo()
  const { loading, children } = useVideoChildren(variant?.slug, locale)

  const coverImage =
    last(images)?.mobileCinematicHigh ??
    last(images)?.large ??
    last(images)?.mobileCinematicLow ??
    ''
  const displayTitle = last(title)?.value ?? ''
  const summary = last(snippet)?.value ?? ''
  const { label: labelText, childCountLabel } = getLabelDetails(
    t,
    label,
    childrenCount ?? children.length
  )

  const languageSlug = variant?.slug?.split('/')?.[1]?.replace('.html', '')

  const handleOpenShare = (): void => setShareDialogOpen(true)
  const handleCloseShare = (): void => setShareDialogOpen(false)

  return (
    <>
      <section
        className="relative isolate flex w-full flex-col justify-end overflow-hidden bg-black text-white"
        style={{ minHeight: '100svh' }}
        data-testid="CollectionHero"
      >
        {coverImage !== '' && (
          <Image
            src={coverImage}
            alt={displayTitle}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/70 to-black" />
        <div className="absolute inset-0 bg-[url('/assets/overlay.svg')] opacity-30 mix-blend-soft-light" />
        <ContentHeader languageSlug={languageSlug} isPersistent />
        <div className="relative z-10 flex max-w-[1920px] flex-col gap-6 pb-16 pt-32 responsive-container">
          <div className="flex max-w-4xl flex-col gap-3">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.6em] text-white/80">
              {`${labelText} • ${childCountLabel.toLowerCase()}`}
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {displayTitle}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <AudioLanguageSelect />
            <ExtendedButton
              type="button"
              variant="outline"
              size="lg"
              onClick={handleOpenShare}
              className="hidden gap-2 border-white/30 bg-white/10 text-white hover:bg-white/20 sm:flex"
            >
              <Share2 className="h-4 w-4" />
              {t('Share')}
            </ExtendedButton>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={t('Share')}
              onClick={handleOpenShare}
              className="text-white hover:bg-white/20 sm:hidden"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
      <ContentPageBlurFilter>
        <div
          className="flex flex-col gap-10 py-14 responsive-container"
          data-testid="PageVideoContainer"
        >
          <div className="flex flex-col gap-3">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.6em] text-white/60">
              {labelText}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="text-3xl font-semibold sm:text-4xl">{displayTitle}</h2>
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.6em] text-white/50">
                {childCountLabel}
              </span>
            </div>
          </div>
          {summary !== '' && (
            <div
              className="rounded-[32px] border border-white/10 bg-white/5 p-6 text-white/80 shadow-[0_45px_80px_-40px_rgba(15,23,42,0.8)]"
              data-testid="CollectionDescription"
            >
              <p className="text-lg leading-relaxed">{summary}</p>
              <div className="mt-6 hidden flex-wrap gap-4 sm:flex">
                <ExtendedButton
                  type="button"
                  variant="outline"
                  onClick={handleOpenShare}
                  className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                >
                  <Share2 className="h-4 w-4" />
                  {t('Share')}
                </ExtendedButton>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-6" data-testid="CollectionVideos">
            <p className="text-sm font-semibold uppercase tracking-[0.6em] text-red-100/70">
              {childCountLabel}
            </p>
            <VideoGrid
              orientation="vertical"
              containerSlug={slug}
              videos={children}
              loading={loading}
            />
          </div>
        </div>
      </ContentPageBlurFilter>
      <DialogShare open={shareDialogOpen} onClose={handleCloseShare} />
    </>
  )
}
