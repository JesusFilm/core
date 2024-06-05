import { ApolloError } from '@apollo/client'
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
import { useSnackbar } from 'notistack'
import {
  MouseEvent,
  ReactElement,
  ReactNode,
  useEffect,
  useMemo,
  useState
} from 'react'
import { v4 as uuidv4 } from 'uuid'

import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'

import { GetEventEmailNotifications_eventEmailNotificationsByJourney as EventEmailNotifications } from '../../../../../__generated__/GetEventEmailNotifications'
import { GetJourneyWithPermissions_journey_userJourneys as UserJourney } from '../../../../../__generated__/GetJourneyWithPermissions'
import { GetUserInvites_userInvites as UserInvite } from '../../../../../__generated__/GetUserInvites'
import { UserJourneyRole } from '../../../../../__generated__/globalTypes'
import { useEventEmailNotificationsUpdate } from '../../../../libs/useEventEmailNotificationsUpdateMutation'

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
  userId?: string
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
  const { enqueueSnackbar } = useSnackbar()
  const [eventEmailNotificationUpdate, { loading }] =
    useEventEmailNotificationsUpdate()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)
  const { id, role, displayName, email, imageUrl, journeyId, userId } =
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
        userId: listItem.user?.id,
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

  async function handleChange(): Promise<void> {
    if (journeyIdFromParent == null) return
    if (userId == null) return
    const uuid = uuidv4()
    try {
      await eventEmailNotificationUpdate({
        variables: {
          id: emailPreference?.id ?? uuid,
          input: {
            userId,
            journeyId: journeyIdFromParent,
            value:
              emailPreference?.value != null ? !emailPreference.value : true
          }
        }
      })
    } catch (error) {
      if (error instanceof ApolloError) {
        if (error.networkError != null) {
          enqueueSnackbar(
            t('Notification update failed. Reload the page or try again.'),
            {
              variant: 'error',
              preventDuplicate: true
            }
          )
          return
        }
      }
      if (error instanceof Error) {
        enqueueSnackbar(error.message, {
          variant: 'error',
          preventDuplicate: true
        })
      }
    }
  }

  const secondaryAction: ReactNode = (
    <>
      {listItem.__typename !== 'UserInvite' && (
        <Switch
          inputProps={{ 'aria-checked': emailPreference?.value }}
          checked={emailPreference?.value}
          onChange={handleChange}
          disabled={
            loading || emailPreference?.userId !== currentUser?.user?.id
          }
        />
      )}
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
