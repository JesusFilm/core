import { ReactElement, useState, useMemo, useEffect, MouseEvent } from 'react'
import ListItem from '@mui/material/ListItem'
import { compact } from 'lodash'
import Button from '@mui/material/Button'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import Avatar from '@mui/material/Avatar'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Menu from '@mui/material/Menu'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import GroupIcon from '@mui/icons-material/Group'
import PersonIcon from '@mui/icons-material/Person'
import { gql, useMutation } from '@apollo/client'
import { UserTeamRole } from '../../../../../__generated__/globalTypes'
import {
  GetUserTeamsAndInvites_userTeams as UserTeam,
  GetUserTeamsAndInvites_userTeamInvites as UserTeamInvite
} from '../../../../../__generated__/GetUserTeamsAndInvites'
import { MenuItem } from '../../../MenuItem'
import { RemoveUserTeam } from '../RemoveUserTeam'
import { UserTeamUpdate } from '../../../../../__generated__/UserTeamUpdate'

interface TeamMemberListItemProps {
  user: UserTeam | UserTeamInvite
  disabled: boolean
}

export const USER_TEAM_UPDATE = gql`
  mutation UserTeamUpdate($userTeamUpdateId: ID!, $input: UserTeamUpdateInput) {
    userTeamUpdate(id: $userTeamUpdateId, input: $input) {
      role
      id
      user {
        id
      }
    }
  }
`

export function TeamMemberListItem({
  user: listItem,
  disabled
}: TeamMemberListItemProps): ReactElement {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)
  const [userTeamUpdate] = useMutation<UserTeamUpdate>(USER_TEAM_UPDATE)

  const { id, email, displayName, imageUrl, role } = useMemo(() => {
    if (listItem.__typename === 'UserTeamInvite') {
      return {
        ...listItem
      }
    }
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

  const menuLabel = useMemo((): string => {
    switch (role) {
      case UserTeamRole.manager:
        return 'Manager'
      case UserTeamRole.member:
        return 'Member'
      case UserTeamRole.guest:
        return 'Guest'
      case undefined:
        return 'Pending'
    }
  }, [role])

  const handleClick = (event: MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = (): void => {
    setAnchorEl(null)
  }

  useEffect(() => {
    return () => {
      setAnchorEl(null)
    }
  }, [])

  const isInvite = listItem.__typename === 'UserTeamInvite'

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
            endIcon={<ArrowDropDownIcon />}
            sx={{
              color: 'text.primary',
              typography: 'body2'
            }}
          >
            {menuLabel}
          </Button>
        }
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
              width: { xs: isInvite ? '110px' : '90%', sm: '90%' },
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
          {!isInvite && (
            <Stack>
              <MenuItem
                label="Manager"
                icon={<GroupIcon />}
                onClick={async () => {
                  handleClose()
                  await userTeamUpdate({
                    variables: {
                      userTeamUpdateId: id,
                      input: { role: UserTeamRole.manager }
                    }
                  })
                }}
              />
              <MenuItem
                label="Member"
                icon={<PersonIcon />}
                onClick={async () => {
                  handleClose()
                  await userTeamUpdate({
                    variables: {
                      userTeamUpdateId: id,
                      input: { role: UserTeamRole.member }
                    }
                  })
                }}
              />
              <MenuItem
                label="Guest"
                icon={<PersonOutlineIcon />}
                onClick={async () => {
                  handleClose()
                  await userTeamUpdate({
                    variables: {
                      userTeamUpdateId: id,
                      input: { role: UserTeamRole.guest }
                    }
                  })
                }}
              />
            </Stack>
          )}
          {!disabled && (
            <RemoveUserTeam id={id} isInvite={isInvite} onClick={handleClose} />
          )}
        </Stack>
      </Menu>
    </>
  )
}
