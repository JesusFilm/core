import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import compact from 'lodash/compact'
import { useTranslation } from 'next-i18next'
import {
  MouseEvent,
  ReactElement,
  ReactNode,
  useEffect,
  useMemo,
  useState
} from 'react'

import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'

import { GetEventEmailNotifications_eventEmailNotificationsByJourney as EventEmailNotifications } from '../../../../../__generated__/GetEventEmailNotifications'
import { GetJourneyWithPermissions_journey_userJourneys as UserJourney } from '../../../../../__generated__/GetJourneyWithPermissions'
import { GetUserInvites_userInvites as UserInvite } from '../../../../../__generated__/GetUserInvites'
import { UserJourneyRole } from '../../../../../__generated__/globalTypes'

import { ApproveUser } from './ApproveUser'
import { PromoteUser } from './PromoteUser'
import { RemoveUser } from './RemoveUser'

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
  currentUser?: UserJourney
  journeyId: string
  emailPreference?: EventEmailNotifications
}

export function UserListItem({
  listItem,
  currentUser,
  journeyId: journeyIdFromParent,
  emailPreference
}: UserListItemProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
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
        return t('Manage')
      case UserJourneyRole.owner:
        return t('Owner')
      default:
        return t('Editor')
    }
  }, [role, t])

  const disableAction = useMemo((): boolean => {
    if (listItem.__typename === 'UserInvite') return false
    if (listItem.user?.id === currentUser?.user?.id) return true
    if (currentUser?.role === UserJourneyRole.owner) return false
    if (
      currentUser?.role === UserJourneyRole.editor &&
      role === UserJourneyRole.inviteRequested
    )
      return false
    return true
  }, [currentUser, listItem, role])

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

  const secondaryAction: ReactNode = (
    <>
      <Switch
        inputProps={{ 'aria-checked': emailPreference?.value ?? false }}
        checked={emailPreference?.value ?? false}
        onChange={() => console.log('I got called')}
      />
      <Button
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        disabled={disableAction}
        endIcon={<ChevronDownIcon />}
        sx={{
          color: 'text.primary',
          typography: 'body2'
        }}
      >
        {isInvite ? t('Pending') : menuLabel}
      </Button>
    </>
  )

  return (
    <>
      <ListItem
        sx={{
          px: 0,
          '& > .MuiListItemSecondaryAction-root': {
            right: 0
          }
        }}
        secondaryAction={secondaryAction}
        data-testid="UserListItem"
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
          {role === 'inviteRequested' && !isInvite && (
            <ApproveUser
              id={id}
              email={email}
              onClick={handleClose}
              journeyId={journeyIdFromParent}
            />
          )}
          {role === 'editor' && currentUser?.role === 'owner' && (
            <PromoteUser id={id} onClick={handleClose} />
          )}
          {!disableAction && (
            <RemoveUser
              id={id}
              email={isInvite ? undefined : email}
              onClick={handleClose}
              journeyId={journeyIdFromParent}
            />
          )}
        </Stack>
      </Menu>
    </>
  )
}
