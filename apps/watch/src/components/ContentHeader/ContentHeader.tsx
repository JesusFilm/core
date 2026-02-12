import { Globe } from 'lucide-react'
import Image from 'next/image'
import NextLink from 'next/link'
import { ReactElement, useState } from 'react'

import { Button } from '@core/shared/ui-modern/components/button'

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
    state: { play, active, loading },
    dispatch: dispatchPlayer
  } = usePlayer()
  const visible = isPersistent || !play || active || loading
  const [hasOpenDialog, setHasOpenDialog] = useState(false)
  const [previousPlayState, setPreviousPlayState] = useState<boolean>(false)

  const handleOpenDialog = (): void => {
    setPreviousPlayState(play)
    setHasOpenDialog(true)
    dispatchPlayer({ type: 'SetPlay', play: false })
  }

  const handleCloseDialog = (): void => {
    setHasOpenDialog(false)
    dispatchPlayer({ type: 'SetPlay', play: previousPlayState })
  }

  return (
    <div
      data-testid="ContentHeader"
      className={`responsive-container absolute top-0 right-0 left-0 z-[99] flex h-[100px] w-full flex-row items-center justify-between gap-4 transition-opacity duration-[225ms] lg:h-[200px] ${
        visible ? 'opacity-100' : 'opacity-0'
      } ${visible ? 'delay-0' : 'delay-[2000ms]'}`}
    >
      <NextLink
        href={
          languageSlug != null && languageSlug !== 'english'
            ? `/${languageSlug}.html`
            : '/'
        }
        locale={false}
        aria-label="Go to Watch home"
        className="flex-shrink-0"
      >
        <Image
          src="/watch/images/jesusfilm-sign.svg"
          alt="Jesus Film Project"
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
          <Globe className="h-5 w-5 drop-shadow-xs" />
        </Button>
        <DialogLangSwitch open={hasOpenDialog} handleClose={handleCloseDialog} />
      </>
    </div>
  )
}
