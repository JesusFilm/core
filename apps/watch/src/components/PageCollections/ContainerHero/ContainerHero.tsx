import { ReactElement } from 'react'

import { ContainerHeroVideo } from '../ContainerHeroVideo'

import { CollectionsHeader } from './CollectionsHeader'

export interface ContainerHeroProps {
  /** Title displayed in the hero section */
  title: string
  /** Text before the year in the description */
  descriptionBeforeYear: string
  /** Text after the year in the description */
  descriptionAfterYear: string
  /** Label for the feedback button */
  feedbackButtonLabel: string
  /** Cover image shown behind the hero */
  coverImageUrl: string
  /** Alt text for the cover image */
  coverImageAlt?: string
  /** Optional language slug for header links */
  languageSlug?: string
}

export function ContainerHero({
  title,
  descriptionBeforeYear,
  descriptionAfterYear,
  feedbackButtonLabel,
  coverImageUrl,
  coverImageAlt,
  languageSlug
}: ContainerHeroProps): ReactElement {
  const currentYear = new Date().getFullYear()

  return (
    <div
      className="h-[90vh] md:h-[70vh] w-full flex items-end relative transition-height duration-300 ease-out bg-stone-900 font-sans"
      data-testid="ContainerHero"
    >
      <CollectionsHeader
        feedbackButtonLabel={feedbackButtonLabel}
        languageSlug={languageSlug}
      />
      <ContainerHeroVideo
        coverImageUrl={coverImageUrl}
        coverImageAlt={coverImageAlt ?? title}
      />

      <div
        data-testid="ContainerHeroTitleContainer"
        className="w-full relative flex flex-col sm:flex-row max-w-[1920px] mx-auto pb-4"
      >
        <div
          className="absolute top-0 left-0 right-0 h-full w-full pointer-events-none md:hidden"
          style={{
            backdropFilter: 'brightness(.6) blur(40px)',
            mask: 'linear-gradient(0deg, rgba(2,0,36,1) 46%, rgba(2,0,36,1) 53%, rgba(0,0,0,0) 100%)'
          }}
        />
        <div
          data-testid="ContainerHeroTitle"
          className="w-full flex padded pb-4 min-h-[500px] items-end"
        >
          <div className="pb-4 sm:pb-0 w-full relative z-[2] flex flex-col gap-4">
            <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-bold text-white opacity-90 mix-blend-screen">
              {title}
            </h2>
            <p
              className="text-secondary-contrast opacity-70 mix-blend-screen z-[2] uppercase tracking-[0.4em] text-white text-sm"
              data-testid="ContainerHeroDescription"
            >
              {`${descriptionBeforeYear} ${currentYear} ${descriptionAfterYear}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
