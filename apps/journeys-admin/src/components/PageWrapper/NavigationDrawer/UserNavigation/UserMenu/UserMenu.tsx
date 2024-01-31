import { useApolloClient } from '@apollo/client'
import LanguageIcon from '@mui/icons-material/Language'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Menu from '@mui/material/Menu'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import compact from 'lodash/compact'
import { User } from 'next-firebase-auth'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Logout2Icon from '@core/shared/ui/icons/Logout2'

import { GetMe_me as ApiUser } from '../../../../../../__generated__/GetMe'
import { LanguageSelector } from '../../../../LanguageSelector'
import { MenuItem } from '../../../../MenuItem'
import { useTeam } from '../../../../Team/TeamProvider'

export interface UserMenuProps {
  apiUser: ApiUser
  profileOpen: boolean
  profileAnchorEl: HTMLElement | null
  handleProfileClose: () => void
  user: User
}

export function UserMenu({
  apiUser,
  profileOpen,
  profileAnchorEl,
  handleProfileClose,
  user
}: UserMenuProps): ReactElement {
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation('apps-journeys-admin')
  const client = useApolloClient()
  const { setActiveTeam } = useTeam()
  const [open, setOpen] = useState(false)

  return (
    <>
      <Menu
        anchorEl={profileAnchorEl}
        open={profileOpen}
        onClose={handleProfileClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
        data-testid="UserMenu"
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{ py: 2, px: 4 }}
          alignItems="center"
        >
          <Box>
            <Avatar
              alt={compact([apiUser.firstName, apiUser.lastName]).join(' ')}
              src={apiUser.imageUrl ?? undefined}
            />
          </Box>
          <Box>
            <Typography>
              {compact([apiUser.firstName, apiUser.lastName]).join(' ')}
            </Typography>
            {user.email != null && (
              <Typography variant="body2" color="textSecondary">
                {user.email}
              </Typography>
            )}
          </Box>
        </Stack>
        <Divider />
        <MenuItem
          label={t('Language')}
          icon={<LanguageIcon />}
          onClick={() => setOpen(true)}
        />
        <MenuItem
          label="Logout"
          icon={<Logout2Icon fontSize="small" />}
          onClick={async () => {
            handleProfileClose()
            await client.resetStore()
            await user.signOut()
            await enqueueSnackbar(t('Logout successful'), {
              variant: 'success',
              preventDuplicate: true
            })
            setActiveTeam(null)
          }}
        />
      </Menu>
      {open && <LanguageSelector open={open} onClose={() => setOpen(false)} />}
    </>
  )
}
