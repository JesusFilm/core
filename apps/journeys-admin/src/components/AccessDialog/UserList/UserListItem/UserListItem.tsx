import { ReactElement, MouseEvent, useState, useEffect } from 'react'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import Menu from '@mui/material/Menu'
import ListItem from '@mui/material/ListItem'
import { compact } from 'lodash'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { GetJourneyWithUserJourneys_journey_userJourneys as UserJourney } from '../../../../../__generated__/GetJourneyWithUserJourneys'
import { RemoveUser } from './RemoveUser'
import { ApproveUser } from './ApproveUser'
import { PromoteUser } from './PromoteUser'

interface ListItemProps {
  userJourney: UserJourney
  disabled: boolean
}

export function UserListItem({
  userJourney,
  disabled
}: ListItemProps): ReactElement {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)
  const { id, role, user } = userJourney

  useEffect(() => {
    return () => {
      setAnchorEl(null)
    }
  }, [])

  const handleClick = (event: MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = (): void => {
    setAnchorEl(null)
  }

  const displayName = compact([user?.firstName, user?.lastName]).join(' ')

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
            disabled={disabled || role === 'owner'}
            endIcon={<ArrowDropDownIcon />}
            sx={{
              color: 'text.primary',
              typography: 'body2'
            }}
          >
            {role === 'inviteRequested' && 'Manage Access'}
            {role === 'owner' && 'Owner'}
            {role === 'editor' && 'Editor'}
          </Button>
        }
      >
        <ListItemAvatar>
          <Avatar src={user?.imageUrl ?? undefined} alt={displayName}>
            {displayName.charAt(0)?.toUpperCase()}
          </Avatar>
        </ListItemAvatar>

        <ListItemText primary={displayName} secondary={user?.email} />
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
        {role === 'inviteRequested' ? (
          <ApproveUser id={id} onClick={handleClose} />
        ) : (
          <PromoteUser id={id} onClick={handleClose} />
        )}
        <Divider />
        <RemoveUser id={id} onClick={handleClose} />
      </Menu>
    </>
  )
}
