import LanguageIcon from '@mui/icons-material/Language'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { ReactElement, useState } from 'react'

import taskbarIcon from '../../../../public/taskbar-icon.svg'
import { LanguageSwitcher } from '../../LanguageSwitcher'

export function GuestCustomizeHeader(): ReactElement {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  function handleHomeClick(): void {
    void router.push('/')
  }

  function handleLanguageOpen(): void {
    setOpen(true)
  }

  function handleLanguageClose(): void {
    setOpen(false)
  }

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{
        position: 'fixed',
        top: 0,
        left: { xs: 0, sm: 0 },
        right: 0,
        zIndex: 1,
        px: '24px',
        pt: '10px',
        pb: '20px',
        pointerEvents: 'none',
        '& > *': { pointerEvents: 'auto' }
      }}
      data-testid="GuestCustomizeHeader"
    >
      <IconButton
        onClick={handleHomeClick}
        aria-label="home"
        disableRipple
        sx={{ p: 0 }}
      >
        <Image src={taskbarIcon} width={32} height={32} alt="Next Steps" />
      </IconButton>
      <IconButton
        onClick={handleLanguageOpen}
        aria-label="language"
        sx={{ p: 0 }}
      >
        <LanguageIcon sx={{ fontSize: 24, color: 'action.active' }} />
      </IconButton>
      {open && (
        <LanguageSwitcher open={open} handleClose={handleLanguageClose} />
      )}
    </Stack>
  )
}
