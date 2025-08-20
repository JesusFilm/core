import LanguageIcon from '@mui/icons-material/Language'
import IconButton from '@mui/material/IconButton'
import Image from 'next/image'
import NextLink from 'next/link'
import { ReactElement, useState } from 'react'

import { LanguageModal } from './LanguageModal'

export function CollectionsHeader({
  feedbackButtonLabel
}: {
  feedbackButtonLabel: string
}): ReactElement {
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false)

  const handleOpenLanguageModal = (): void => {
    setIsLanguageModalOpen(true)
  }

  const handleCloseLanguageModal = (): void => {
    setIsLanguageModalOpen(false)
  }

  return (
    <>
      <div
        data-testid="CollectionsHeader"
        className="absolute top-0 left-0 right-0 w-full h-[100px] lg:h-[200px] max-w-[1920px] mx-auto z-99 flex items-center justify-between padded"
      >
        <NextLink href="https://www.jesusfilm.org/watch" locale="">
          <Image
            src="/watch/assets/jesusfilm-sign.svg"
            alt="JesusFilm Project"
            width={70}
            height={70}
            className="max-w-[50px] lg:max-w-[70px]"
          />
        </NextLink>
        <IconButton
          data-testid="LanguageButton"
          onClick={handleOpenLanguageModal}
          aria-label="select language"
          tabIndex={0}
          sx={{
            color: 'white'
          }}
        >
          <LanguageIcon />
        </IconButton>
      </div>
      <LanguageModal
        open={isLanguageModalOpen}
        onClose={handleCloseLanguageModal}
        feedbackButtonLabel={feedbackButtonLabel}
      />
    </>
  )
}
