import { ReactElement, MouseEvent, useEffect, useState } from 'react'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Menu from '@mui/material/Menu'
import List from '@mui/material/List'
import MuiListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Theme } from '@mui/material/styles'
import { gql, useLazyQuery } from '@apollo/client'
import { compact } from 'lodash'
import Skeleton from '@mui/material/Skeleton'
import { CopyTextField } from '@core/shared/ui'
import { AuthUser } from 'next-firebase-auth'
import {
  GetJourneyWithUserJourneys,
  GetJourneyWithUserJourneys_journey_userJourneys as UserJourney
} from '../../../__generated__/GetJourneyWithUserJourneys'
import { UserJourneyRole } from '../../../__generated__/globalTypes'
import { RemoveUser } from './RemoveUser'
import { ApproveUser } from './ApproveUser'
import { PromoteUser } from './PromoteUser'

export const GET_JOURNEY_WITH_USER_JOURNEYS = gql`
  query GetJourneyWithUserJourneys($id: ID!) {
    journey: adminJourney(id: $id, idType: slug) {
      id
      userJourneys {
        id
        role
        user {
          id
          firstName
          lastName
          email
          imageUrl
        }
      }
    }
  }
`

interface AccessDialogProps {
  journeySlug: string
  open?: boolean
  onClose?: () => void
  AuthUser?: AuthUser
}

export function AccessDialog({
  journeySlug,
  open,
  onClose,
  AuthUser
}: AccessDialogProps): ReactElement {
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const currentUserId = AuthUser?.id

  const [loadJourney, { loading, data }] =
    useLazyQuery<GetJourneyWithUserJourneys>(GET_JOURNEY_WITH_USER_JOURNEYS, {
      variables: { id: journeySlug }
    })

  const disable =
    data?.journey?.userJourneys?.find(
      (userJourney) => userJourney.user?.id === currentUserId
    )?.role !== UserJourneyRole.owner

  useEffect(() => {
    if (open === true) {
      void loadJourney()
    }
  }, [open, loadJourney])

  return (
    <Dialog
      open={open ?? false}
      onClose={onClose}
      fullScreen={!smUp}
      maxWidth="sm"
    >
      <Box
        sx={{
          mx: 6,
          my: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Typography variant="subtitle1">Invite Other Editors</Typography>
        <IconButton onClick={onClose} aria-label="Close">
          <CloseRoundedIcon />
        </IconButton>
      </Box>
      <DialogContent dividers>
        <List>
          <MuiListItem sx={{ px: 0 }}>
            <CopyTextField
              value={
                typeof window !== 'undefined'
                  ? `${window.location.host.endsWith('.chromatic.com')
                    ? 'https://admin.nextstep.is'
                    : window.location.origin
                  }/journeys/${journeySlug}`
                  : undefined
              }
              messageText="Editor invite link copied"
              helperText="Anyone with this link can see journey and ask for editing rights.
              You can accept or reject every request."
            />
          </MuiListItem>
          {!loading && (
            <UserJourneyList
              title="Requested Editing Rights"
              userJourneys={data?.journey?.userJourneys?.filter(
                ({ role }) => role === UserJourneyRole.inviteRequested
              )}
              disable={disable}
            />
          )}
          <UserJourneyList
            title="Users With Access"
            loading={loading}
            userJourneys={data?.journey?.userJourneys?.filter(
              ({ role }) => role !== UserJourneyRole.inviteRequested
            )}
            disable={disable}
          />
        </List>
      </DialogContent>
    </Dialog>
  )
}

interface UserJourneyListProps {
  title: string
  loading?: boolean
  userJourneys?: UserJourney[] | null
  disable: boolean
}

function UserJourneyList({
  title,
  loading,
  userJourneys,
  disable
}: UserJourneyListProps): ReactElement {
  return (
    <>
      {((userJourneys?.length != null && userJourneys.length > 0) ||
        loading === true) && (
          <>
            <Divider sx={{ my: 2 }} />
            <MuiListItem sx={{ px: 0 }}>{title}</MuiListItem>
          </>
        )}
      {loading === true &&
        [0, 1, 2].map((i) => (
          <MuiListItem sx={{ px: 0 }} key={i}>
            <ListItemAvatar>
              <Skeleton variant="circular" width={40} height={40} />
            </ListItemAvatar>
            <ListItemText
              primary={<Skeleton variant="text" width="60%" />}
              secondary={<Skeleton variant="text" width="30%" />}
            />
          </MuiListItem>
        ))}
      {userJourneys?.map((userJourney) => (
        <ListItem
          key={userJourney.id}
          userJourney={userJourney}
          disabled={disable}
        />
      ))}
    </>
  )
}

interface ListItemProps {
  userJourney: UserJourney
  disabled: boolean
}

function ListItem({ userJourney, disabled }: ListItemProps): ReactElement {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)
  const { id, role, user } = userJourney

  useEffect(() => () => setAnchorEl(null), [])

  const handleClick = (event: MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = (): void => {
    setAnchorEl(null)
  }

  const displayName = compact([user?.firstName, user?.lastName]).join(' ')

  return (
    <>
      <MuiListItem
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
            {role === 'inviteRequested' && 'Manage'}
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
      </MuiListItem>
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
