import { ReactElement, MouseEvent, useState, useEffect, useMemo } from 'react'
import { compact } from 'lodash'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import Menu from '@mui/material/Menu'
import Stack from '@mui/material/Stack'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { UserJourneyRole } from '../../../../../__generated__/globalTypes'
import { GetJourneyWithUserJourneys_journey_userJourneys as UserJourney } from '../../../../../__generated__/GetJourneyWithUserJourneys'
import { GetUserInvites_userInvites as UserInvite } from '../../../../../__generated__/GetUserInvites'
import { RemoveUser } from './RemoveUser'
import { ApproveUser } from './ApproveUser'
import { PromoteUser } from './PromoteUser'

interface UserItem {
  id: string
  journeyId?: string
  role: UserJourneyRole
  displayName?: string
  email: string
  imageUrl?: string
  removedAt?: string
  acceptedAt?: string
}

interface UserListItemProps {
  listItem: UserJourney | UserInvite
  currentUser: UserJourney
}

export function UserListItem({
  listItem,
  currentUser
}: UserListItemProps): ReactElement {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)
  const { id, role, displayName, email, imageUrl, journeyId } =
    useMemo((): UserItem => {
      if (listItem.__typename === 'UserInvite') {
        return {
          ...listItem,
          role: UserJourneyRole.inviteRequested
        }
      }
      return {
        id: listItem.id,
        role: listItem.role,
        displayName: compact([
          listItem.user?.firstName,
          listItem.user?.lastName
        ]).join(' '),
        email: listItem.user?.email ?? '',
        imageUrl: listItem.user?.imageUrl ?? ''
      }
    }, [listItem])

  const isInvite = journeyId != null

  const menuLabel = useMemo((): string => {
    switch (role) {
      case UserJourneyRole.inviteRequested:
        return 'Manage'
      case UserJourneyRole.owner:
        return 'Owner'
      default:
        return 'Editor'
    }
  }, [role])

  const { role: userRole } = currentUser

  const disableAction = useMemo((): boolean => {
    switch (userRole) {
      case UserJourneyRole.owner: {
        return role === UserJourneyRole.owner
      }
      case UserJourneyRole.editor: {
        return role !== UserJourneyRole.inviteRequested
      }
      default: {
        return true
      }
    }
  }, [userRole, role])

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
            disabled={disableAction}
            endIcon={<ArrowDropDownIcon />}
            sx={{
              color: 'text.primary',
              typography: 'body2'
            }}
          >
            {isInvite ? 'Pending' : menuLabel}
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
          {role === 'inviteRequested' && !isInvite && (
            <ApproveUser id={id} email={email} onClick={handleClose} />
          )}
          {role === 'editor' && userRole === 'owner' && (
            <PromoteUser id={id} onClick={handleClose} />
          )}
          {!disableAction && (
            <RemoveUser
              id={id}
              email={isInvite ? undefined : email}
              onClick={handleClose}
            />
          )}
        </Stack>
      </Menu>
    </>
  )
}
