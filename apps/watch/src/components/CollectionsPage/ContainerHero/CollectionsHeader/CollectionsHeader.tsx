import Image from 'next/image'
import NextLink from 'next/link'
import { ReactElement } from 'react'

export function CollectionsHeader(): ReactElement {
  return (
    <>
      <div
        data-testid="CollectionsHeader"
        className="absolute top-0 left-0 right-0 w-full h-[100px] lg:h-[200px] max-w-[1920px] mx-auto z-99 flex items-center justify-between padded"
      >
        <NextLink href="https://www.jesusfilm.org/watch">
          <Image
            src="/watch/assets/jesusfilm-sign.svg"
            alt="JesusFilm Project"
            width={70}
            height={70}
            className="max-w-[50px] lg:max-w-[70px]"
          />
        </NextLink>
      </div>
    </>
  )
}
