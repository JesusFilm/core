import Image from 'next/image'
import NextLink from 'next/link'
import { ReactElement } from 'react'

import { usePlayer } from '../../../../libs/playerContext/PlayerContext'
import { AudioLanguageButton } from '../../../VideoContentPage/AudioLanguageButton'

import { HeaderSearch } from './HeaderSearch'

interface ContentHeaderProps {
  languageSlug?: string
  isPersistent?: boolean
  languageId?: string
}

export function ContentHeader({
  languageSlug,
  isPersistent = false,
  languageId
}: ContentHeaderProps): ReactElement {
  const {
    state: { play, active, loading }
  } = usePlayer()
  const visible = isPersistent || !play || active || loading
  return (
    <div
      data-testid="ContentHeader"
      className={`absolute top-0 left-0 right-0 w-full h-[100px] lg:h-[200px]
        z-[99] responsive-container flex flex-row items-center justify-between gap-4
        transition-opacity duration-[225ms] ${
          visible ? 'opacity-100' : 'opacity-0'
        } ${visible ? 'delay-0' : 'delay-[2000ms]'}`}
    >
      <NextLink
        href={`/watch${languageSlug != null && languageSlug !== 'english' ? `/${languageSlug}.html` : ''}`}
        locale={false}
        aria-label="Go to Watch home"
        className="flex-shrink-0"
      >
        <Image
          src="/watch/assets/jesusfilm-sign.svg"
          alt="JesusFilm Project"
          width={70}
          height={70}
          className="max-w-[50px] lg:max-w-[70px]"
        />
      </NextLink>
      {isPersistent && (
        <div className="flex flex-1 justify-center px-4">
          <HeaderSearch languageId={languageId} />
        </div>
      )}
      <AudioLanguageButton componentVariant="icon" />
    </div>
  )
}
