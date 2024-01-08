import { gql, useMutation } from '@apollo/client'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import Stack from '@mui/material/Stack'
import compact from 'lodash/compact'
import { MouseEvent, ReactElement, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import AlertCircleIcon from '@core/shared/ui/icons/AlertCircle'
import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'

import { GetUserTeamsAndInvites_userTeams as UserTeam } from '../../../../../../__generated__/GetUserTeamsAndInvites'
import { UserTeamRole } from '../../../../../../__generated__/globalTypes'
import { UserTeamUpdate } from '../../../../../../__generated__/UserTeamUpdate'
import { MenuItem } from '../../../../MenuItem'
import { UserTeamDeleteMenuItem } from '../../UserTeamDeleteMenuItem'

interface UserTeamListItemProps {
  user: UserTeam
  disabled?: boolean
  variant?: 'readonly' | 'default'
  handleTeamDataChange: () => Promise<void>
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
  handleTeamDataChange
}: UserTeamListItemProps): ReactElement {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)
  const { t } = useTranslation('apps-journeys-admin')
  const [userTeamUpdate] = useMutation<UserTeamUpdate>(USER_TEAM_UPDATE)

  const { id, email, displayName, imageUrl, role } = useMemo(() => {
    return {
      id: listItem.id,
      email: listItem?.user?.email,
      displayName: compact([
        listItem?.user?.firstName,
        listItem?.user?.lastName
      ]).join(' '),
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
      <ListItem
        sx={{
          px: 0,
          '& > .MuiListItemSecondaryAction-root': {
            right: 0
          }
        }}
        secondaryAction={
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
        }
        data-testid={`UserTeamListItem-${listItem.id}`}
      >
        <ListItemAvatar>
          <Avatar src={imageUrl ?? undefined} alt={displayName ?? email}>
            {displayName != null
              ? displayName.charAt(0)?.toUpperCase()
              : email.charAt(0).toUpperCase()}
          </Avatar>
        </ListItemAvatar>

        <ListItemText
          primary={displayName}
          secondary={email}
          sx={{
            '& > .MuiListItemText-secondary': {
              width: { xs: '90%', sm: '90%' },
              whiteSpace: 'nowrap',
              overflow: 'clip',
              textOverflow: 'ellipsis'
            }
          }}
        />
      </ListItem>

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
            handleTeamDataChange={handleTeamDataChange}
          />
        </Stack>
      </Menu>
    </>
  )
}
