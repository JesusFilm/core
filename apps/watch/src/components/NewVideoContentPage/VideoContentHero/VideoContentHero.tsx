import { ReactElement } from 'react'

import { useVideo } from '../../../libs/videoContext'

import { ContentHeader } from './ContentHeader'
import { HeroVideo } from './HeroVideo'
import clsx from 'clsx'

export function VideoContentHero({
  isPreview = false
}: {
  isPreview?: boolean
}): ReactElement {
  const { variant } = useVideo()

  const languageSlug = variant?.slug?.split('/')[1]

  return (
    <div
      className={clsx(
        'w-full flex items-end relative bg-[#131111] z-[1] transition-all duration-300 ease-out',
        {
          'preview-video': isPreview,
          'h-[90svh] md:h-[80svh]': !isPreview
        }
      )}
      data-testid="ContentHero"
    >
      <ContentHeader
        languageSlug={languageSlug?.replace('.html', '')}
        isPersistent={isPreview}
      />
      <HeroVideo isPreview={isPreview} key={variant?.hls} />
      <div
        data-testid="ContainerHeroTitleContainer"
        className="w-full relative flex flex-col sm:flex-row max-w-[1920px] mx-auto pb-4"
      >
        <div
          className="absolute top-0 left-0 right-0 h-full w-full pointer-events-none block md:hidden"
          style={{
            backdropFilter: 'brightness(.6) blur(40px)',
            maskImage:
              'linear-gradient(0deg, rgba(2,0,36,1) 46%, rgba(2,0,36,1) 53%, rgba(0,0,0,0) 100%)'
          }}
        />
      </div>
    </div>
  )
}
