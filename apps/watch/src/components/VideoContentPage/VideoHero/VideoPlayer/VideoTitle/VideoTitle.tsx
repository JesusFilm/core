import { ReactElement } from 'react'

interface VideoTitleProps {
  play: boolean
  videoTitle: string
  videoSnippet: string
}

export function VideoTitle({
  play,
  videoTitle,
  videoSnippet
}: VideoTitleProps): ReactElement {
  return (
    <div
      className={`
        w-full z-[2] flex flex-col
        px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12
        transition-opacity duration-[250ms]
        ${!play ? 'opacity-100' : 'opacity-0'}
        ${!play ? 'delay-0' : 'delay-[2000ms]'}
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
