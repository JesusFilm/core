import { ReactElement, useState, useMemo, MouseEvent } from 'react'
import ListItem from '@mui/material/ListItem'
import Button from '@mui/material/Button'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import Avatar from '@mui/material/Avatar'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Menu from '@mui/material/Menu'
import { GetUserTeamsAndInvites_userTeamInvites as UserTeamInvite } from '../../../../../__generated__/GetUserTeamsAndInvites'
import { UserTeamInviteRemoveMenuItem } from '../UserTeamInviteRemoveMenuItem'

interface UserTeamInviteListItemProps {
  user: UserTeamInvite
  disabled: boolean
}

export function UserTeamInviteListItem({
  user: listItem,
  disabled
}: UserTeamInviteListItemProps): ReactElement {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)

  const { id, email } = useMemo(() => {
    return {
      ...listItem
    }
  }, [listItem])

  const handleClick = (event: MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = (): void => {
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
            endIcon={<ArrowDropDownIcon />}
            sx={{
              color: 'text.primary',
              typography: 'body2'
            }}
          >
            Pending
          </Button>
        }
      >
        <ListItemAvatar>
          <Avatar src={undefined} alt={email}>
            {email.charAt(0).toUpperCase()}
          </Avatar>
        </ListItemAvatar>

        <ListItemText
          secondary={email}
          sx={{
            '& > .MuiListItemText-secondary': {
              width: { xs: '110px', sm: '90%' },
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
          {!disabled && (
            <UserTeamInviteRemoveMenuItem id={id} onClick={handleClose} />
          )}
        </Stack>
      </Menu>
    </>
  )
}
