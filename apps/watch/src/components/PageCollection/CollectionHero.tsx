import last from 'lodash/last'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import LinkExternal from '@core/shared/ui/icons/LinkExternal'

import { getLabelDetails } from '../../libs/utils/getLabelDetails/getLabelDetails'
import { useVideo } from '../../libs/videoContext'
import { ContentHeader } from '../ContentHeader'
import { HeroOverlay } from '../HeroOverlay'

interface CollectionHeroProps {
  languageSlug?: string
  onShare?: () => void
}

export function CollectionHero({
  languageSlug,
  onShare
}: CollectionHeroProps): ReactElement {
  const { t } = useTranslation('apps-watch')
  const { title, images, imageAlt, label, childrenCount } = useVideo()
  const { label: labelText, childCountLabel } = getLabelDetails(
    t,
    label,
    childrenCount
  )

  const heroImage = last(images)?.mobileCinematicHigh
  const heroAlt = last(imageAlt)?.value ?? last(title)?.value ?? 'Collection hero'

  return (
    <div
      className="w-full flex items-end relative bg-[#000] z-[1] aspect-[var(--ratio-sm-expanded)] md:aspect-[var(--ratio-md-expanded)] overflow-hidden"
      data-testid="CollectionHero"
    >
      <div
        className="fixed top-0 left-0 right-0 mx-auto z-0 aspect-[var(--ratio-sm-expanded)] md:aspect-[var(--ratio-md-expanded)] overflow-hidden max-w-[1920px]"
      >
        {heroImage != null && (
          <Image
            src={heroImage}
            alt={heroAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        )}
        <HeroOverlay />
      </div>
      <ContentHeader languageSlug={languageSlug} isPersistent />
      <div className="relative z-10 w-full responsive-container pb-10 pt-20 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-4 flex-1">
            <p className="text-sm font-semibold tracking-wider text-red-100/70 uppercase">
              {labelText}
              {childCountLabel != null
                ? ` • ${childCountLabel.toLowerCase()}`
                : null}
            </p>
            <h1 className="text-3xl md:text-5xl font-bold">
              {last(title)?.value}
            </h1>
          </div>
          {onShare != null && (
            <button
              onClick={onShare}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-gray-900 font-bold uppercase tracking-wider bg-white hover:bg-[#cb333b] hover:text-white transition-colors duration-200 text-sm cursor-pointer shrink-0"
            >
              <LinkExternal className="w-4 h-4" />
              {t('Share')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
