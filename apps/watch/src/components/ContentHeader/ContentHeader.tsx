import { Button } from '@core/shared/uimodern/components'
import { Globe } from 'lucide-react'
import Image from 'next/image'
import NextLink from 'next/link'
import { ReactElement, useState } from 'react'

import { usePlayer } from '../../libs/playerContext/PlayerContext'

import { DialogLangSwitch } from '../DialogLangSwitch'

interface ContentHeaderProps {
  languageSlug?: string
  isPersistent?: boolean
}

export function ContentHeader({
  languageSlug,
  isPersistent = false
}: ContentHeaderProps): ReactElement {
  const {
    state: { play, active, loading }
  } = usePlayer()
  const visible = isPersistent || !play || active || loading
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleOpenDialog = (): void => {
    setIsDialogOpen(true)
  }

  const handleCloseDialog = (): void => {
    setIsDialogOpen(false)
  }

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
          src="/assets/jesusfilm-sign.svg"
          alt="JesusFilm Project"
          width={70}
          height={70}
          className="max-w-[50px] lg:max-w-[70px]"
        />
      </NextLink>
      <>
        <Button
          onClick={handleOpenDialog}
          variant="ghost"
          size="icon"
          data-testid="AudioLanguageButton"
          aria-label="select audio language"
          tabIndex={0}
          className="text-white hover:bg-white/10"
        >
          <Globe className="h-5 w-5" />
        </Button>
        <DialogLangSwitch open={isDialogOpen} handleClose={handleCloseDialog} />
      </>
    </div>
  )
}
