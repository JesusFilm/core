import Archive from '@mui/icons-material/Archive'
import CheckCircle from '@mui/icons-material/CheckCircle'
import DeleteForever from '@mui/icons-material/DeleteForever'
import DeleteOutline from '@mui/icons-material/DeleteOutline'
import MoreVert from '@mui/icons-material/MoreVert'
import Unarchive from '@mui/icons-material/Unarchive'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import { useRouter } from 'next/router'
import { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { MenuItem } from '../../MenuItem'

interface JourneyListMenuProps {
  onClick: (event: string) => void
}

export function JourneyListMenu({
  onClick
}: JourneyListMenuProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()

  const activeTab = router?.query.tab?.toString() ?? 'active'
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
      {['active', 'archived', 'trashed'].includes(activeTab) && (
        <>
          <IconButton
            edge="end"
            color="inherit"
            sx={{ mx: 1 }}
            onClick={handleShowMenu}
          >
            <MoreVert />
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
          >
            {activeTab === 'active' && [
              <MenuItem
                label={t('Archive All')}
                icon={<Archive />}
                onClick={() => handleEvent('archiveAllActive')}
                key="archiveAllActive"
              />,
              <MenuItem
                label={t('Trash All')}
                icon={<DeleteOutline />}
                onClick={() => handleEvent('trashAllActive')}
                key="trashAllActive"
              />
            ]}
            {activeTab === 'archived' && [
              <MenuItem
                label={t('Unarchive All')}
                icon={<Unarchive />}
                onClick={() => handleEvent('restoreAllArchived')}
                key="restoreAllArchived"
              />,
              <MenuItem
                label={t('Trash All')}
                icon={<DeleteOutline />}
                onClick={() => handleEvent('trashAllArchived')}
                key="trashAllArchived"
              />
            ]}
            {activeTab === 'trashed' && [
              <MenuItem
                label={t('Restore All')}
                icon={<CheckCircle />}
                onClick={() => handleEvent('restoreAllTrashed')}
                key="restoreAllTrashed"
              />,
              <MenuItem
                label={t('Delete All Forever')}
                icon={<DeleteForever />}
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
