import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import { useRouter } from 'next/router'
import { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'

import CheckContained from '@core/shared/ui/icons/CheckContained'
import FileShred from '@core/shared/ui/icons/FileShred'
import FolderDown1 from '@core/shared/ui/icons/FolderDown1'
import FolderUp1 from '@core/shared/ui/icons/FolderUp1'
import More from '@core/shared/ui/icons/More'
import Trash2 from '@core/shared/ui/icons/Trash2'

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
            <More />
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
                icon={<FolderUp1 />}
                onClick={() => handleEvent('archiveAllActive')}
                key="archiveAllActive"
              />,
              <MenuItem
                label={t('Trash All')}
                icon={<Trash2 />}
                onClick={() => handleEvent('trashAllActive')}
                key="trashAllActive"
              />
            ]}
            {activeTab === 'archived' && [
              <MenuItem
                label={t('Unarchive All')}
                icon={<FolderDown1 />}
                onClick={() => handleEvent('restoreAllArchived')}
                key="restoreAllArchived"
              />,
              <MenuItem
                label={t('Trash All')}
                icon={<Trash2 />}
                onClick={() => handleEvent('trashAllArchived')}
                key="trashAllArchived"
              />
            ]}
            {activeTab === 'trashed' && [
              <MenuItem
                label={t('Restore All')}
                icon={<CheckContained />}
                onClick={() => handleEvent('restoreAllTrashed')}
                key="restoreAllTrashed"
              />,
              <MenuItem
                label={t('Delete All Forever')}
                icon={<FileShred />}
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
