import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Menu from '@mui/material/Menu'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import compact from 'lodash/compact'
import { useTranslation } from 'next-i18next'
import { MouseEvent, ReactElement, useEffect, useMemo, useState } from 'react'

import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'

import { GetJourneyWithPermissions_journey_userJourneys as UserJourney } from '../../../../../__generated__/GetJourneyWithPermissions'
import { GetUserInvites_userInvites as UserInvite } from '../../../../../__generated__/GetUserInvites'
import { UserJourneyRole } from '../../../../../__generated__/globalTypes'
import { NotificationSwitch } from '../../NotificationSwitch'

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
}

export function UserListItem({
  listItem,
  currentUser,
  journeyId: journeyIdFromParent
}: UserListItemProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
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

  return (
    <>
      <Grid
        container
        spacing={1}
        alignItems="center"
        data-testid="UserListItem"
      >
        <Grid size={{xs: 2, sm: 1}}>
          <Avatar src={imageUrl ?? undefined} alt={displayName ?? email}>
            {displayName != null
              ? displayName.charAt(0)?.toUpperCase()
              : email.charAt(0).toUpperCase()}
          </Avatar>
        </Grid>
        <Grid size={{xs: 5, sm: 7}}>
          <Stack sx={{ ml: 2 }}>
            <Typography variant="subtitle2" sx={{ width: '100%', flexGrow: 1 }}>
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
        <Grid size={{xs: 2, sm: 2}}>
          {listItem.__typename !== 'UserInvite' && (
            <NotificationSwitch
              name={listItem?.user?.firstName}
              journeyId={journeyIdFromParent}
              checked={listItem?.journeyNotification?.visitorInteractionEmail}
              disabled={userId !== currentUser?.user?.id}
            />
          )}
        </Grid>
        <Grid size={{xs: 3, sm: 2}}>
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
