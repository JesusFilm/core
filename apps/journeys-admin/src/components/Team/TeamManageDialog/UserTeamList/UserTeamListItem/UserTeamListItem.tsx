import { gql, useMutation } from '@apollo/client'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import Stack from '@mui/material/Stack'
import compact from 'lodash/compact'
import { useTranslation } from 'next-i18next'
import { MouseEvent, ReactElement, useMemo, useState } from 'react'

import AlertCircleIcon from '@core/shared/ui/icons/AlertCircle'
import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'

import { GetEventEmailNotifications_eventEmailNotificationsByJourney as EventEmailNotifications } from '../../../../../../__generated__/GetEventEmailNotifications'
import { GetUserTeamsAndInvites_userTeams as UserTeam } from '../../../../../../__generated__/GetUserTeamsAndInvites'
import { UserTeamRole } from '../../../../../../__generated__/globalTypes'
import { UserTeamUpdate } from '../../../../../../__generated__/UserTeamUpdate'
import { NotificationSwitch } from '../../../../AccessDialog/NotificationSwitch'
import { MenuItem } from '../../../../MenuItem'
import { UserTeamDeleteMenuItem } from '../../UserTeamDeleteMenuItem'

interface UserTeamListItemProps {
  user: UserTeam
  disabled?: boolean
  variant?: 'readonly' | 'default'
  emailPreference?: EventEmailNotifications
  journeyId?: string
}

export const USER_TEAM_UPDATE = gql`
  mutation UserTeamUpdate($id: ID!, $input: UserTeamUpdateInput) {
    userTeamUpdate(id: $id, input: $input) {
      role
      id
      user {
        id
      }
    }
  }
`
export function UserTeamListItem({
  user: listItem,
  disabled,
  variant = 'default',
  emailPreference,
  journeyId
}: UserTeamListItemProps): ReactElement {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)
  const { t } = useTranslation('apps-journeys-admin')
  const [userTeamUpdate] = useMutation<UserTeamUpdate>(USER_TEAM_UPDATE)

  const { id, email, displayName, imageUrl, role, userId } = useMemo(() => {
    return {
      id: listItem.id,
      email: listItem?.user?.email,
      displayName: compact([
        listItem?.user?.firstName,
        listItem?.user?.lastName
      ]).join(' '),
      userId: listItem?.user?.id,
      imageUrl: listItem?.user?.imageUrl,
      role: listItem.role
    }
  }, [listItem])

  const menuLabel = useMemo((): string | undefined => {
    switch (role) {
      case UserTeamRole.manager:
        return t('Manager')
      case UserTeamRole.member:
        return t('Member')
    }
  }, [role, t])

  function handleClick(event: MouseEvent<HTMLElement>): void {
    setAnchorEl(event.currentTarget)
  }
  function handleClose(): void {
    setAnchorEl(null)
  }

  return (
    <>
      <Grid container spacing={1} alignItems="center">
        <Grid xs={1}>
          <Avatar src={imageUrl ?? undefined} alt={displayName ?? email}>
            {displayName != null
              ? displayName.charAt(0)?.toUpperCase()
              : email.charAt(0).toUpperCase()}
          </Avatar>
        </Grid>
        <Grid xs={7}>
          <ListItemText
            primary={displayName}
            secondary={email}
            sx={{
              ml: 2,
              '& > .MuiListItemText-secondary': {
                width: { xs: '90%', sm: '90%' },
                whiteSpace: 'nowrap',
                overflow: 'clip',
                textOverflow: 'ellipsis'
              }
            }}
          />
        </Grid>
        <Grid xs={2}>
          {journeyId != null && (
            <NotificationSwitch
              id={emailPreference?.id}
              userId={userId}
              name={listItem?.user?.firstName}
              journeyId={journeyId}
              checked={emailPreference?.value}
            />
          )}
        </Grid>
        <Grid xs={2}>
          <Button
            aria-controls={open ? 'basic-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClick}
            disabled={disabled}
            endIcon={<ChevronDownIcon />}
            sx={{
              color: 'text.primary',
              typography: 'body2',
              '& > .MuiButton-endIcon': {
                display: variant === 'readonly' ? 'none' : 'inherit'
              },
              '&.Mui-disabled': {
                color:
                  variant === 'readonly'
                    ? 'text.primary'
                    : 'rgba(0, 0, 0, 0.26)'
              }
            }}
          >
            {menuLabel}
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
          {role === UserTeamRole.member && (
            <MenuItem
              label={t('Manager')}
              icon={<AlertCircleIcon />}
              onClick={async () => {
                handleClose()
                await userTeamUpdate({
                  variables: {
                    id,
                    input: { role: UserTeamRole.manager }
                  }
                })
              }}
            />
          )}
          {role === UserTeamRole.manager && (
            <MenuItem
              label={t('Member')}
              icon={<AlertCircleIcon />}
              onClick={async () => {
                handleClose()
                await userTeamUpdate({
                  variables: {
                    id,
                    input: { role: UserTeamRole.member }
                  }
                })
              }}
            />
          )}
          <UserTeamDeleteMenuItem
            id={id}
            onClick={handleClose}
            disabled={disabled}
          />
        </Stack>
      </Menu>
    </>
  )
}
