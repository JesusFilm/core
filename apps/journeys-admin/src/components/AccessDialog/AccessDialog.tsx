import { ReactElement, MouseEvent, useEffect, useState } from 'react'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import Menu from '@mui/material/Menu'
import List from '@mui/material/List'
import MuiListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import DraftsIcon from '@mui/icons-material/Drafts'
import LinkIcon from '@mui/icons-material/Link'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import GroupAddIcon from '@mui/icons-material/GroupAdd'
import { gql, useLazyQuery, useQuery } from '@apollo/client'
import { compact } from 'lodash'
import Skeleton from '@mui/material/Skeleton'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Theme } from '@mui/material/styles'
import { CopyTextField } from '@core/shared/ui/CopyTextField'
import { Dialog } from '@core/shared/ui/Dialog'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import {
  GetJourneyWithUserJourneys,
  GetJourneyWithUserJourneys_journey_userJourneys as UserJourney
} from '../../../__generated__/GetJourneyWithUserJourneys'
import { UserJourneyRole } from '../../../__generated__/globalTypes'
import { GetCurrentUser } from '../../../__generated__/GetCurrentUser'
import { EmailInviteInput } from '../EmailInviteInput'
import { RemoveUser } from './RemoveUser'
import { ApproveUser } from './ApproveUser'
import { PromoteUser } from './PromoteUser'

export const GET_JOURNEY_WITH_USER_JOURNEYS = gql`
  query GetJourneyWithUserJourneys($id: ID!) {
    journey: adminJourney(id: $id, idType: databaseId) {
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

export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    me {
      id
      email
    }
  }
`

interface AccessDialogProps {
  journeyId: string
  open?: boolean
  onClose: () => void
}

export function AccessDialog({
  journeyId,
  open,
  onClose
}: AccessDialogProps): ReactElement {
  const [selectedInviteMethod, setSelectedInviteMethod] = useState('Link')
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const menuOpen = Boolean(anchorEl)

  const handleClick = (event: MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget)
  }
  const handleMenuItemClick = (event: MouseEvent<HTMLElement>): void => {
    setAnchorEl(null)
    setSelectedInviteMethod(event.currentTarget.innerText)
  }

  const [loadJourney, { loading, data }] =
    useLazyQuery<GetJourneyWithUserJourneys>(GET_JOURNEY_WITH_USER_JOURNEYS, {
      variables: { id: journeyId }
    })

  const { data: currentUserData } = useQuery<GetCurrentUser>(GET_CURRENT_USER)

  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const disable =
    data?.journey?.userJourneys?.find(
      (userJourney) => userJourney.user?.email === currentUserData?.me?.email
    )?.role !== UserJourneyRole.owner

  useEffect(() => {
    if (open === true) {
      void loadJourney()
    }
  }, [open, loadJourney])

  return (
    <>
      <Dialog
        open={open ?? false}
        onClose={onClose}
        dialogTitle={{
          title: 'Invite Other Editors',
          closeButton: true
        }}
        divider
        fullscreen={!smUp}
      >
        <List sx={{ pt: 0 }}>
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
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            sx={{
              mb: '16px',
              mt: '20px'
            }}
          >
            <GroupAddIcon />
            <Typography
              sx={{
                fontFamily: 'Montserrat',
                fontWeight: '600',
                fontSize: '18px',
                marginLeft: '12px'
              }}
            >
              Add new using
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={
                selectedInviteMethod === 'Link' ? <LinkIcon /> : <DraftsIcon />
              }
              endIcon={<KeyboardArrowDownIcon />}
              sx={{
                borderRadius: '16px',
                width: '124px',
                height: '32px',
                color: '#26262E',
                border: '1px solid #DEDFE0',
                fontWeight: '400',
                fontFamily: 'Open Sans',
                fontSize: '16px',
                padding: '4px',
                marginLeft: '12px',
                '&:hover': {
                  borderColor: 'gray'
                }
              }}
              onClick={handleClick}
            >
              {selectedInviteMethod}
            </Button>
          </Box>

          <Menu anchorEl={anchorEl} open={menuOpen}>
            <MenuItem onClick={handleMenuItemClick}>Link</MenuItem>
            <MenuItem onClick={handleMenuItemClick}>Email</MenuItem>
          </Menu>
          <MuiListItem sx={{ p: 0 }}>
            {selectedInviteMethod === 'Link' ? (
              <CopyTextField
                value={
                  typeof window !== 'undefined'
                    ? `${
                        window.location.host.endsWith('.chromatic.com')
                          ? 'https://admin.nextstep.is'
                          : window.location.origin
                      }/journeys/${journeyId}`
                    : undefined
                }
                messageText="Editor invite link copied"
                helperText="Anyone with this link can see journey and ask for editing rights.
              You can accept or reject every request."
              />
            ) : (
              <EmailInviteInput />
            )}
          </MuiListItem>
        </List>
      </Dialog>
    </>
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
      <Divider sx={{ my: 2 }} />
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
