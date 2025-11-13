import Image from 'next/image'
import { ReactElement } from 'react'

interface ContainerHeroVideoProps {
  coverImageUrl: string
  coverImageAlt: string
}

export function ContainerHeroVideo({
  coverImageUrl,
  coverImageAlt
}: ContainerHeroVideoProps): ReactElement {
  return (
    <div
      className="absolute inset-0 z-0 mx-auto max-w-[1919px]"
      data-testid="ContainerHeroVideo"
    >
      <Image
        src={coverImageUrl}
        alt={coverImageAlt}
        fill
        priority
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 1920px"
        data-testid="ContainerHeroCoverImage"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/90"
        data-testid="ContainerHeroVideoOverlay"
      />
    </div>
  )
}
