import Box from '@mui/material/Box'
import { useTranslation } from 'next-i18next'
import { ComponentProps, ReactElement, useState } from 'react'

import ShareIcon from '@core/shared/ui/icons/Share'

import { Item } from '../Item/Item'

import { ShareDialog } from './ShareDialog'

interface ShareItemProps {
  variant: ComponentProps<typeof Item>['variant']
  closeMenu?: () => void
}

export function ShareItem({
  variant,
  closeMenu
}: ShareItemProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const [openShareDialog, setOpenShareDialog] = useState(false)

  function handleShowMenu(): void {
    setOpenShareDialog(true)
  }

  function handleCloseMenu(): void {
    setOpenShareDialog(false)
    closeMenu?.() // test e2e
  }

  return (
    <Box data-testid="ShareItem">
      <Item
        variant={variant}
        label={t('Share')}
        icon={<ShareIcon />}
        onClick={handleShowMenu}
        ButtonProps={{ variant: 'contained' }}
      />
      <ShareDialog open={openShareDialog} onClose={handleCloseMenu} />
    </Box>
  )
}
