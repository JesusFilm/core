import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/GridLegacy'
import Menu from '@mui/material/Menu'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { MouseEvent, ReactElement, useState } from 'react'

import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'

import { GetUserTeamsAndInvites_userTeamInvites as UserTeamInvite } from '../../../../../../__generated__/GetUserTeamsAndInvites'
import { UserTeamInviteRemoveMenuItem } from '../../UserTeamInviteRemoveMenuItem'

interface UserTeamInviteListItemProps {
  user: UserTeamInvite
  disabled?: boolean
}

export function UserTeamInviteListItem({
  user,
  disabled
}: UserTeamInviteListItemProps): ReactElement {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)

  const { id, email } = user

  function handleClick(event: MouseEvent<HTMLElement>): void {
    setAnchorEl(event.currentTarget)
  }

  function handleClose(): void {
    setAnchorEl(null)
  }
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <>
      <Grid
        container
        spacing={1}
        alignItems="center"
        data-testId="UserTeamInviteListItem"
      >
        <Grid xs={2} sm={1}>
          <Avatar src={undefined} alt={email}>
            {email.charAt(0).toUpperCase()}
          </Avatar>
        </Grid>
        <Grid xs={7} sm={9}>
          <Stack sx={{ ml: 2 }}>
            <Typography
              variant="body1"
              sx={{
                width: { xs: '90%', sm: '90%' },
                whiteSpace: 'nowrap',
                overflow: 'clip',
                textOverflow: 'ellipsis'
              }}
            >
              {email}
            </Typography>
          </Stack>
        </Grid>
        <Grid xs={3} sm={2} justifyContent="flex-end" sx={{ display: 'flex' }}>
          <Button
            aria-controls={open ? 'basic-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClick}
            disabled={disabled}
            endIcon={<ChevronDownIcon />}
            sx={{
              color: 'text.primary',
              typography: 'body2'
            }}
          >
            {t('Invited')}
          </Button>
        </Grid>
      </Grid>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        <Stack divider={<Divider />}>
          <UserTeamInviteRemoveMenuItem
            id={id}
            onClick={handleClose}
            disabled={disabled}
          />
        </Stack>
      </Menu>
    </>
  )
}
