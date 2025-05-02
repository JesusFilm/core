import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import { useTeam } from '@core/journeys/ui/TeamProvider'
import CheckContainedIcon from '@core/shared/ui/icons/CheckContained'
import FileShredIcon from '@core/shared/ui/icons/FileShred'
import FolderDown1Icon from '@core/shared/ui/icons/FolderDown1'
import FolderUp1Icon from '@core/shared/ui/icons/FolderUp1'
import MoreIcon from '@core/shared/ui/icons/More'
import Trash2Icon from '@core/shared/ui/icons/Trash2'

import { UserTeamRole } from '../../../../__generated__/globalTypes'
import { useCurrentUserLazyQuery } from '../../../libs/useCurrentUserLazyQuery'
import { MenuItem } from '../../MenuItem'

interface JourneyListMenuProps {
  onClick: (event: string) => void
}

export function JourneyListMenu({
  onClick
}: JourneyListMenuProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const { activeTeam } = useTeam()
  const { loadUser, data: currentUser } = useCurrentUserLazyQuery()

  const activeTab = router?.query.tab?.toString() ?? 'active'
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  const isTeamManager = activeTeam?.userTeams?.some(
    ({ user: { id }, role }) =>
      id === currentUser?.id && role === UserTeamRole.manager
  )

  const handleShowMenu = (event: React.MouseEvent<HTMLButtonElement>): void => {
    void loadUser()
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
            sx={{ mx: 3 }}
            onClick={handleShowMenu}
          >
            <MoreIcon />
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
            data-testid="JourneyListMenu"
          >
            {activeTab === 'active' && [
              <MenuItem
                label={t('Archive All')}
                icon={<FolderUp1Icon />}
                onClick={() => handleEvent('archiveAllActive')}
                key="archiveAllActive"
                disabled={!isTeamManager}
              />,
              <MenuItem
                label={t('Trash All')}
                icon={<Trash2Icon />}
                onClick={() => handleEvent('trashAllActive')}
                key="trashAllActive"
                disabled={!isTeamManager}
              />
            ]}
            {activeTab === 'archived' && [
              <MenuItem
                label={t('Unarchive All')}
                icon={<FolderDown1Icon />}
                onClick={() => handleEvent('restoreAllArchived')}
                key="restoreAllArchived"
                disabled={!isTeamManager}
              />,
              <MenuItem
                label={t('Trash All')}
                icon={<Trash2Icon />}
                onClick={() => handleEvent('trashAllArchived')}
                key="trashAllArchived"
                disabled={!isTeamManager}
              />
            ]}
            {activeTab === 'trashed' && [
              <MenuItem
                label={t('Restore All')}
                icon={<CheckContainedIcon />}
                onClick={() => handleEvent('restoreAllTrashed')}
                key="restoreAllTrashed"
                disabled={!isTeamManager}
              />,
              <MenuItem
                label={t('Delete All Forever')}
                icon={<FileShredIcon />}
                onClick={() => handleEvent('deleteAllTrashed')}
                key="deleteAllTrashed"
                disabled={!isTeamManager}
              />
            ]}
          </Menu>
        </>
      )}
    </>
  )
}
