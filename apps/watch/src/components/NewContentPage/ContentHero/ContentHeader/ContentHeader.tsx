import Stack from '@mui/material/Stack'
import Image from 'next/image'
import NextLink from 'next/link'
import { ReactElement, useState } from 'react'

import { AudioLanguageButton } from '../../../VideoContentPage/AudioLanguageButton'

export function ContentHeader(): ReactElement {
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false)

  const handleOpenLanguageModal = (): void => {
    setIsLanguageModalOpen(true)
  }

  const handleCloseLanguageModal = (): void => {
    setIsLanguageModalOpen(false)
  }

  return (
    <Stack
      data-testid="ContentHeader"
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        height: { xs: '100px', lg: '200px' },
        maxWidth: '1920px',
        mx: 'auto',
        zIndex: 99,
        px: { xs: 4, sm: 6, md: 8, lg: 10, xl: 12 }
      }}
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
      <AudioLanguageButton componentVariant="icon" />
    </Stack>
  )
}
