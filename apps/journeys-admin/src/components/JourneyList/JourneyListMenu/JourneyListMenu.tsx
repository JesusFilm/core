import { NextRouter } from 'next/router'
import { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'
import MoreVert from '@mui/icons-material/MoreVert'
import Archive from '@mui/icons-material/Archive'
import DeleteForever from '@mui/icons-material/DeleteForever'
import CheckCircle from '@mui/icons-material/CheckCircle'
import Unarchive from '@mui/icons-material/Unarchive'
import DeleteOutline from '@mui/icons-material/DeleteOutline'
import MuiMenu from '@mui/material/Menu'
import IconButton from '@mui/material/IconButton'
import { MenuItem } from '../../MenuItem'

interface JourneyListMenuProps {
  router: NextRouter
  onClick: (event: string) => void
}

export default function JourneyListMenu({
  router,
  onClick
}: JourneyListMenuProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const activeTab = (router.query.tab as string) ?? 'active'

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
            edge="start"
            size="small"
            color="inherit"
            sx={{ mr: 2 }}
            onClick={handleShowMenu}
          >
            <MoreVert />
          </IconButton>
          <MuiMenu
            id="edit-journey-actions"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
            MenuListProps={{
              'aria-labelledby': 'edit-journey-actions'
            }}
          >
            {activeTab === 'active' && (
              <>
                <MenuItem
                  label={t('Archive All')}
                  icon={<Archive />}
                  onClick={() => handleEvent('archiveAllActive')}
                />
                <MenuItem
                  label={t('Trash All')}
                  icon={<DeleteOutline />}
                  onClick={() => handleEvent('trashAllActive')}
                />
              </>
            )}
            {activeTab === 'archived' && (
              <>
                <MenuItem
                  label={t('Unarchive All')}
                  icon={<Unarchive />}
                  onClick={() => handleEvent('restoreAllArchived')}
                />
                <MenuItem
                  label={t('Trash All')}
                  icon={<DeleteOutline />}
                  onClick={() => handleEvent('trashAllArchived')}
                />
              </>
            )}
            {activeTab === 'trashed' && (
              <>
                <MenuItem
                  label={t('Restore All')}
                  icon={<CheckCircle />}
                  onClick={() => handleEvent('restoreAllTrashed')}
                />
                <MenuItem
                  label={t('Delete All Forever')}
                  icon={<DeleteForever />}
                  onClick={() => handleEvent('deleteAllTrashed')}
                />
              </>
            )}
          </MuiMenu>
        </>
      )}
    </>
  )
}
