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
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import IconButton from '@mui/material/IconButton'

interface JourneyListMenuProps {
  router: NextRouter
}

export default function JourneyListMenu({
  router
}: JourneyListMenuProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const activeTab = (router.query.tab as string) ?? 'active'

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const handleShowMenu = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget)
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
              <MenuItem onClick={handleCloseMenu}>
                <ListItemIcon>
                  <Archive />
                </ListItemIcon>
                <ListItemText>{t('Archive All')}</ListItemText>
              </MenuItem>
            )}
            {activeTab === 'archived' && (
              <MenuItem onClick={handleCloseMenu}>
                <ListItemIcon>
                  <Unarchive />
                </ListItemIcon>
                <ListItemText>{t('Unarchive All')}</ListItemText>
              </MenuItem>
            )}
            {activeTab === 'trashed' && (
              <>
                <MenuItem onClick={handleCloseMenu}>
                  <ListItemIcon>
                    <CheckCircle />
                  </ListItemIcon>
                  <ListItemText>{t('Restore All')}</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleCloseMenu}>
                  <ListItemIcon>
                    <DeleteForever />
                  </ListItemIcon>
                  <ListItemText>{t('Delete All Forever')}</ListItemText>
                </MenuItem>
              </>
            )}
            {['active', 'archived'].includes(activeTab) && (
              <MenuItem onClick={handleCloseMenu}>
                <ListItemIcon>
                  <DeleteOutline />
                </ListItemIcon>
                <ListItemText>{t('Trash All')}</ListItemText>
              </MenuItem>
            )}
          </MuiMenu>
        </>
      )}
    </>
  )
}
