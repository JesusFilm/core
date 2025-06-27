import { ReactElement } from 'react'

import { useWatch } from '../../../../../libs/watchContext'

interface VideoTitleProps {
  videoTitle: string
  videoSnippet: string
}

export function VideoTitle({
  videoTitle,
  videoSnippet
}: VideoTitleProps): ReactElement {
  const {
    state: {
      player: { play, active, loading }
    }
  } = useWatch()
  const visible = !play || active || loading

  return (
    <div
      className={`
        w-full z-[2] flex flex-col
        px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12
        transition-opacity duration-[225ms]
        ${visible ? 'opacity-100' : 'opacity-0'}
        ${visible ? 'delay-0' : 'delay-[2000ms]'}
      `}
      style={{
        transitionTimingFunction: 'ease-out'
      }}
    >
      <h1
        className="
          font-bold text-white opacity-90 mix-blend-screen 
          flex-grow mb-1 text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-sans
        "
      >
        {videoTitle}
      </h1>

      <h4
        data-testid="ContainerHeroDescription"
        className="
          opacity-50 mix-blend-screen z-[2] 
          uppercase tracking-[0.1em] text-white
          text-sm md:text-base lg:text-lg font-sans
        "
      >
        {videoSnippet}
      </h4>
    </div>
  )
}
