import { useApolloClient } from '@apollo/client'
import LanguageIcon from '@mui/icons-material/Language'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Menu from '@mui/material/Menu'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import compact from 'lodash/compact'
import { useRouter } from 'next/router'
import { User } from 'next-firebase-auth'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'

import { useTeam } from '@core/journeys/ui/TeamProvider'
import Logout2Icon from '@core/shared/ui/icons/Logout2'
import Mail1 from '@core/shared/ui/icons/Mail1'

import { GetMe_me as ApiUser } from '../../../../../../__generated__/GetMe'
import { LanguageSwitcher } from '../../../../LanguageSwitcher'
import { MenuItem } from '../../../../MenuItem'

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
  const router = useRouter()

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
          label={t('Email Preferences')}
          icon={<Mail1 />}
          onClick={async () =>
            await router.push(`/email-preferences/${apiUser.email}`)
          }
          testId="EmailPreferences"
        />
        <MenuItem
          label={t('Language')}
          icon={<LanguageIcon />}
          onClick={() => setOpen(true)}
          testId="Language"
        />
        <MenuItem
          label={t('Logout')}
          icon={<Logout2Icon fontSize="small" />}
          onClick={async () => {
            await user.signOut()
            client.clearStore()
            if (!router.pathname.startsWith('/templates')) {
              const redirectUrl = `/users/sign-in?redirect=${encodeURIComponent(window.location.href)}`
              window.location.assign(redirectUrl)
            }
          }}
          testId="LogOut"
        />
      </Menu>
      {open && (
        <LanguageSwitcher open={open} handleClose={() => setOpen(false)} />
      )}
    </>
  )
}
