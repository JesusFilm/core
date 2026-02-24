import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import CheckContainedIcon from '@core/shared/ui/icons/CheckContained'
import FileShredIcon from '@core/shared/ui/icons/FileShred'
import FolderDown1Icon from '@core/shared/ui/icons/FolderDown1'
import FolderUp1Icon from '@core/shared/ui/icons/FolderUp1'
import MoreIcon from '@core/shared/ui/icons/More'
import Trash2Icon from '@core/shared/ui/icons/Trash2'
import { palette } from '@core/shared/ui/themes/journeysAdmin/tokens/colors'

import { MenuItem } from '../../MenuItem'

interface JourneyListMenuProps {
  onClick: (event: string) => void
}

export function JourneyListMenu({
  onClick
}: JourneyListMenuProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()

  const currentStatus = router?.query.status?.toString() ?? 'active'
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const handleShowMenu = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget)
  }
  const handleEvent = (event: string): void => {
    onClick(event)
    handleCloseMenu()
  }

  const handleCloseMenu = (): void => {
    setAnchorEl(null)
  }
  return (
    <>
      {['active', 'archived', 'trashed'].includes(currentStatus) && (
        <>
          <IconButton
            edge="end"
            color="inherit"
            aria-label={t('Journey list actions')}
            sx={{
              mx: { xs: 0, sm: 3 },
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '&:hover': {
                borderRadius: '8px'
              }
            }}
            onClick={handleShowMenu}
            data-testid="JourneyListMenuButton"
          >
            <MoreIcon
              data-testid="MoreIcon"
              sx={{
                width: '20px',
                height: '20px',
                color: palette[700]
              }}
            />
          </IconButton>
          <Menu
            id="edit-journey-actions"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
            MenuListProps={{
              'aria-labelledby': 'edit-journey-actions'
            }}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right'
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right'
            }}
            slotProps={{
              paper: {
                sx: {
                  mt: '6px',
                  borderRadius: '8px'
                }
              }
            }}
            data-testid="JourneyListMenu"
          >
            {currentStatus === 'active' && [
              <MenuItem
                label={t('Archive All')}
                icon={<FolderUp1Icon />}
                onClick={() => handleEvent('archiveAllActive')}
                key="archiveAllActive"
              />,
              <MenuItem
                label={t('Trash All')}
                icon={<Trash2Icon />}
                onClick={() => handleEvent('trashAllActive')}
                key="trashAllActive"
              />
            ]}
            {currentStatus === 'archived' && [
              <MenuItem
                label={t('Unarchive All')}
                icon={<FolderDown1Icon />}
                onClick={() => handleEvent('restoreAllArchived')}
                key="restoreAllArchived"
              />,
              <MenuItem
                label={t('Trash All')}
                icon={<Trash2Icon />}
                onClick={() => handleEvent('trashAllArchived')}
                key="trashAllArchived"
              />
            ]}
            {currentStatus === 'trashed' && [
              <MenuItem
                label={t('Restore All')}
                icon={<CheckContainedIcon />}
                onClick={() => handleEvent('restoreAllTrashed')}
                key="restoreAllTrashed"
              />,
              <MenuItem
                label={t('Delete All Forever')}
                icon={<FileShredIcon />}
                onClick={() => handleEvent('deleteAllTrashed')}
                key="deleteAllTrashed"
              />
            ]}
          </Menu>
        </>
      )}
    </>
  )
}
