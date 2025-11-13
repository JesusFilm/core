import last from 'lodash/last'
import Image from 'next/image'
import { ReactElement } from 'react'

import { useVideo } from '../../libs/videoContext'

export function CollectionHero(): ReactElement {
  const { images, imageAlt, title } = useVideo()
  const coverImage = last(images)?.mobileCinematicHigh
  const altText =
    last(imageAlt)?.value ?? last(title)?.value ?? 'Collection hero image'

  return (
    <div
      className="relative isolate h-[420px] w-full md:h-[520px] lg:h-[640px]"
      data-testid="CollectionHero"
    >
      {coverImage != null ? (
        <Image
          src={coverImage}
          alt={altText}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      ) : (
        <div className="h-full w-full bg-stone-900" aria-hidden="true" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/95" aria-hidden="true" />
      <div
        className="absolute inset-0 opacity-30"
        style={{ backgroundImage: "url('/assets/overlay.svg')", backgroundRepeat: 'repeat' }}
        aria-hidden="true"
      />
    </div>
  )
}
