import Image from 'next/image'
import NextLink from 'next/link'
import { ReactElement } from 'react'

import { AudioLanguageButton } from '../../../VideoContentPage/AudioLanguageButton'

export function ContentHeader(): ReactElement {
  return (
    <div
      data-testid="ContentHeader"
      className="absolute top-0 left-0 right-0 w-full h-[100px] lg:h-[200px] max-w-[1920px] mx-auto z-[99] px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 flex flex-row items-center justify-between"
    >
      <NextLink href="/watch">
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
