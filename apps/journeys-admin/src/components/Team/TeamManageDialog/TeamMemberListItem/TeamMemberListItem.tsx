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
import { UserTeams_userTeams as UserTeam } from '../../../../../__generated__/UserTeams'
// import { RemoveUser } from '../../../AccessDialog/UserList/UserListItem/RemoveUser'
import { MenuItem } from '../../../MenuItem'
import { RemoveUserTeam } from '../RemoveUserTeam'

interface TeamMemberListItemProps {
  user: UserTeam
  currentUser: UserTeam
}

export const USER_TEAM_ROLE_MANAGE = gql`
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
  user: userTeam,
  currentUser
}: TeamMemberListItemProps): ReactElement {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)
  const [userTeamUpdate] = useMutation(USER_TEAM_ROLE_MANAGE)

  const { id, email, displayName, imageUrl, role } = useMemo(() => {
    return {
      id: userTeam.id,
      email: userTeam.user.email,
      displayName: compact([
        userTeam.user.firstName,
        userTeam.user.lastName
      ]).join(' '),
      imageUrl: userTeam.user.imageUrl,
      role: userTeam.role
    }
  }, [userTeam])

  const menuLabel = useMemo((): string => {
    switch (role) {
      case UserTeamRole.manager:
        return 'Manager'
      case UserTeamRole.member:
        return 'Member'
      case UserTeamRole.guest:
        return 'Guest'
    }
  }, [role])

  const { role: userRole } = currentUser

  const disableAction = useMemo((): boolean => {
    switch (userRole) {
      case UserTeamRole.guest: {
        return true
      }
      case UserTeamRole.member: {
        return true
      }
      default: {
        return false
      }
    }
  }, [userRole])

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
            disabled={disableAction || currentUser.user.id === userTeam.user.id}
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

        <ListItemText primary={displayName} secondary={email} />
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

          {!disableAction && (
            <RemoveUserTeam id={id} email={email} onClick={handleClose} /> // finish this component once UserInvites is ready
          )}
        </Stack>
      </Menu>
    </>
  )
}
