import Image from 'next/image'
import NextLink from 'next/link'
import { ReactElement } from 'react'

import { usePlayer } from '../../../../libs/playerContext/PlayerContext'
import { AudioLanguageButton } from '../../../VideoContentPage/AudioLanguageButton'

interface ContentHeaderProps {
  languageSlug?: string
}

export function ContentHeader({
  languageSlug
}: ContentHeaderProps): ReactElement {
  const {
    state: { play, active, loading }
  } = usePlayer()
  const visible = !play || active || loading
  return (
    <div
      data-testid="ContentHeader"
      className={`absolute top-0 right-0 left-0 z-[99] mx-auto flex h-[100px] w-full max-w-[1920px] flex-row items-center justify-between px-4 transition-opacity duration-[225ms] sm:px-6 md:px-8 lg:h-[200px] lg:px-10 xl:px-12 ${
        visible ? 'opacity-100' : 'opacity-0'
      } ${visible ? 'delay-0' : 'delay-[2000ms]'}`}
    >
      <NextLink
        href={`/watch${languageSlug != null && languageSlug !== 'english' ? `/${languageSlug}.html` : ''}`}
        locale={false}
      >
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
