import last from 'lodash/last'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { getLabelDetails } from '../../libs/utils/getLabelDetails/getLabelDetails'
import { useVideo } from '../../libs/videoContext'
import { ContentHeader } from '../ContentHeader'
import { HeroOverlay } from '../HeroOverlay'

interface CollectionHeroProps {
  languageSlug?: string
}

export function CollectionHero({
  languageSlug
}: CollectionHeroProps): ReactElement {
  const { t } = useTranslation('apps-watch')
  const { title, snippet, images, imageAlt, label, childrenCount } = useVideo()
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
      <ContentHeader languageSlug={languageSlug} isPersistent />
      <div className="relative z-10 w-full responsive-container pb-10 pt-20 flex flex-col gap-4">
        <p className="text-sm font-semibold tracking-wider text-red-100/70 uppercase">
          {labelText}
          {childCountLabel != null
            ? ` • ${childCountLabel.toLowerCase()}`
            : null}
        </p>
        <h1 className="text-3xl md:text-5xl font-bold">
          {last(title)?.value}
        </h1>
        {last(snippet)?.value != null && (
          <p className="text-lg text-stone-200/80 max-w-3xl">
            {last(snippet)?.value}
          </p>
        )}
      </div>
    </div>
  )
}
