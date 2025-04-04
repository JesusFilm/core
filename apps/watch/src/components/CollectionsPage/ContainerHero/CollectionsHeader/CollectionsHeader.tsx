import useScrollTrigger from '@mui/material/useScrollTrigger'
import Image from 'next/image'
import NextLink from 'next/link'
import { ReactElement } from 'react'

import logo from '../../../Header/assets/minimal-logo.png'

export function CollectionsHeader(): ReactElement {
  const fadeIn = useScrollTrigger({
    disableHysteresis: true,
    threshold: 200
  })

  return (
    <>
      <div
        data-testid="CollectionsHeader"
        className="fixed top-0 left-0 right-0 w-full h-[100px] bg-red-500 z-99 flex items-center justify-between padded"
        style={{
          transition:
            'background-color 0.1s ease-in, backdrop-filter 0.1s ease-in',
          backdropFilter: fadeIn ? 'blur(10px)' : 'none',
          backgroundColor: fadeIn ? 'rgba(0, 0, 0, 0.7)' : 'transparent'
        }}
      >
        <NextLink href="https://www.jesusfilm.org/">
          <Image
            src={logo}
            alt="Jesus Film Project Logo"
            width={70}
            height={70}
          />
        </NextLink>
      </div>
    </>
  )
}
