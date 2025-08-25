import { gql, useMutation } from '@apollo/client'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Menu from '@mui/material/Menu'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import compact from 'lodash/compact'
import { useTranslation } from 'next-i18next'
import { MouseEvent, ReactElement, useMemo, useState } from 'react'

import AlertCircleIcon from '@core/shared/ui/icons/AlertCircle'
import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'

import { GetJourneyWithPermissions_journey_team_userTeams as JourneyTeamUserTeam } from '../../../../../../__generated__/GetJourneyWithPermissions'
import { GetUserTeamsAndInvites_userTeams as UserTeam } from '../../../../../../__generated__/GetUserTeamsAndInvites'
import { UserTeamRole } from '../../../../../../__generated__/globalTypes'
import { UserTeamUpdate } from '../../../../../../__generated__/UserTeamUpdate'
import { NotificationSwitch } from '../../../../AccessDialog/NotificationSwitch'
import { MenuItem } from '../../../../MenuItem'
import { UserTeamDeleteMenuItem } from '../../UserTeamDeleteMenuItem'

interface UserTeamListItemProps {
  user: JourneyTeamUserTeam | UserTeam
  disabled?: boolean
  variant?: 'readonly' | 'default'
  journeyId?: string
  currentUserTeam: JourneyTeamUserTeam | UserTeam | undefined
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
  journeyId,
  currentUserTeam
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

  const checked =
    'journeyNotification' in listItem
      ? listItem?.journeyNotification?.visitorInteractionEmail
      : false

  return (
    <>
      <Grid container spacing={1} alignItems="center">
        <Grid size={{xs: 2, sm: 1}}>
          <Avatar src={imageUrl ?? undefined} alt={displayName ?? email}>
            {displayName != null
              ? displayName.charAt(0)?.toUpperCase()
              : email.charAt(0).toUpperCase()}
          </Avatar>
        </Grid>
        <Grid size={{xs: journeyId != null ? 5 : 7, sm: journeyId != null ? 7 : 9}}>
          <Stack sx={{ ml: 2 }}>
            <Typography variant="subtitle2" sx={{ width: '100%' }}>
              {displayName}
            </Typography>
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
        {journeyId != null && (
          <Grid size={{xs: 2, sm: 2}}>
            {journeyId != null && (
              <NotificationSwitch
                name={listItem?.user?.firstName}
                journeyId={journeyId}
                checked={checked}
                disabled={currentUserTeam?.user?.id !== userId}
              />
            )}
          </Grid>
        )}
        <Grid size={{xs: 3, sm: 2}}>
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
