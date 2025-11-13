import Image from 'next/image'
import last from 'lodash/last'
import { ReactElement } from 'react'

import { useVideo } from '../../libs/videoContext'
import { ContentHeader } from '../ContentHeader'

export function CollectionHero(): ReactElement {
  const { images, imageAlt, title, variant } = useVideo()
  const imageUrl = last(images)?.mobileCinematicHigh ?? undefined
  const altText =
    last(imageAlt)?.value ?? last(title)?.value ?? 'Collection hero image'
  const languageSlug = variant?.slug?.split('/')[1]?.replace('.html', '')

  return (
    <div className="relative w-full bg-black aspect-[var(--ratio-sm-expanded)] md:aspect-[var(--ratio-md-expanded)]">
      <ContentHeader languageSlug={languageSlug} />
      {imageUrl != null && (
        <Image
          src={imageUrl}
          alt={altText}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/50 to-black/90" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/60" />
    </div>
  )
}
