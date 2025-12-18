import last from 'lodash/last'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import LinkExternal from '@core/shared/ui/icons/LinkExternal'

import { blurImage, useBlurhash } from '../../libs/blurhash'
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
  const heroAlt =
    last(imageAlt)?.value ?? last(title)?.value ?? 'Collection hero'

  // Use blurhash for better loading UX
  const { blurhash, dominantColor } = useBlurhash(heroImage)
  const blurDataURL = blurhash
    ? blurImage(blurhash, dominantColor ?? '#000000')
    : undefined

  return (
    <div
      className="relative z-[1] flex aspect-[var(--ratio-sm-expanded)] w-full items-end overflow-hidden bg-[#000] md:aspect-[var(--ratio-md-expanded)]"
      data-testid="CollectionHero"
    >
      <div className="fixed top-0 right-0 left-0 z-0 mx-auto aspect-[var(--ratio-sm-expanded)] max-w-[1920px] overflow-hidden md:aspect-[var(--ratio-md-expanded)]">
        {heroImage != null && (
          <Image
            src={heroImage}
            alt={heroAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
            {...(blurDataURL != null
              ? { placeholder: 'blur' as const, blurDataURL }
              : {})}
          />
        )}
        <HeroOverlay />
      </div>
      <ContentHeader languageSlug={languageSlug} isPersistent />
      <div className="responsive-container relative z-10 flex w-full flex-col gap-4 pt-20 pb-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-1 flex-col gap-4">
            <p className="text-sm font-semibold tracking-wider text-red-100/70 uppercase">
              {labelText}
              {childCountLabel != null
                ? ` • ${childCountLabel.toLowerCase()}`
                : null}
            </p>
            <h1 className="text-3xl font-bold md:text-5xl">
              {last(title)?.value}
            </h1>
          </div>
          {onShare != null && (
            <button
              onClick={onShare}
              className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold tracking-wider text-gray-900 uppercase transition-colors duration-200 hover:bg-[#cb333b] hover:text-white"
            >
              <LinkExternal className="h-4 w-4" />
              {t('Share')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
