import Image from 'next/image'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'

import { LANGUAGE_MAPPINGS } from '../../../../libs/localeMapping'
import { usePlayer } from '../../../../libs/playerContext/PlayerContext'
import { AudioLanguageButton } from '../../../VideoContentPage/AudioLanguageButton'

/**
 * Determines the correct logo link based on the current URL path.
 * For inner pages with language slugs, returns /watch/{languageSlug}.html
 * Otherwise returns /watch
 */
function getLogoLink(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean)

  // Find if there's a language slug in the path
  for (const segment of segments) {
    const cleanSegment = segment.replace(/\.html$/, '')
    const mapping = Object.values(LANGUAGE_MAPPINGS).find((m) =>
      m.languageSlugs.includes(cleanSegment)
    )

    if (mapping) {
      // Found a language slug, return the watch path with that language
      return `/watch/${cleanSegment}`
    }
  }

  // No language slug found, return /watch
  return '/watch'
}

export function ContentHeader(): ReactElement {
  const {
    state: { play, active, loading }
  } = usePlayer()
  const router = useRouter()
  const logoLink = router?.asPath ? getLogoLink(router.asPath) : '/watch'
  const visible = !play || active || loading
  return (
    <div
      data-testid="ContentHeader"
      className={`absolute top-0 left-0 right-0 w-full h-[100px] lg:h-[200px] 
        max-w-[1920px] mx-auto z-[99] px-4 sm:px-6 md:px-8 lg:px-10 
        xl:px-12 flex flex-row items-center justify-between 
        transition-opacity duration-[225ms] ${
          visible ? 'opacity-100' : 'opacity-0'
        } ${visible ? 'delay-0' : 'delay-[2000ms]'}`}
    >
      <NextLink href={logoLink}>
        <Image
          src="/watch/assets/jesusfilm-sign.svg"
          alt="JesusFilm Project"
          width={70}
          height={70}
          className="max-w-[50px] lg:max-w-[70px]"
        />
      </NextLink>
      <AudioLanguageButton componentVariant="icon" />
    </div>
  )
}
