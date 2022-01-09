import { ReactElement, useState, useEffect, useRef } from 'react'
import {
  Button,
  Modal,
  Box,
  Avatar,
  Typography,
  Divider,
  FilledInput,
  FormControl,
  Snackbar,
  Fade,
  useTheme,
  Menu,
  CircularProgress,
  ClickAwayListener
} from '@mui/material'
import {
  ArrowDropDown,
  CloseRounded,
  ContentCopyRounded,
  LinkRounded
} from '@mui/icons-material'
import {
  GetJourney_journey_userJourneys as UserJourneys,
  GetJourney_journey as Journey
} from '../../../__generated__/GetJourney'
import { RemoveUser } from './RemoveUser'
import { ApproveUser } from './ApproveUser'
import { PromoteUser } from './PromoteUser'
import { gql, useLazyQuery } from '@apollo/client'

interface InviteUserModalProps {
  journey: Journey
}

export const GET_USERS_JOURNEYS = gql`
  query GetJourneyforInvitedUsers($journeyId: ID!) {
    journey(id: $journeyId) {
      id
      userJourneys {
        id
        role
        userId
        journeyId
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

export const InviteUserModal = ({
  journey
}: InviteUserModalProps): ReactElement => {
  const [open, setOpen] = useState(false)
  const [uj, setUsersJourneys] = useState<Journey>()
  const theme = useTheme()
  const [loadUsersJourneys, { loading, data }] = useLazyQuery(
    GET_USERS_JOURNEYS,
    { variables: { journeyId: journey.id }, fetchPolicy: 'network-only' }
  )
  const handleOpen = (): void => {
    setOpen(true)
    loadUsersJourneys().catch((err) => console.log(err))
  }

  const handleClose = (): void => setOpen(false)

  // https://nextsteps.is/journeys/${journey.slug}/invite suggested link structure in figma
  const [showAlert, setShowAlert] = useState(false)
  const inviteLinkRef = useRef<string>()

  useEffect(() => {
    inviteLinkRef.current = `${window.location.origin}/journeys/${journey.slug}/invite`

    if (!loading && data !== undefined) {
      setUsersJourneys(data.journey)
    }
  }, [loading, data, uj, journey])

  const handleCopyLinkOpen = async (): Promise<void> => {
    await navigator.clipboard.writeText(inviteLinkRef.current ?? '')
    setShowAlert(true)
  }

  const handleCopyLinkClose = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ): void => {
    if (reason === 'clickaway') {
      return
    }
    setShowAlert(false)
  }

  return (
    <>
      {/* Button to be removed and it's functionalities when merged to journeys single journey */}
      {/* This modal should be progamatically called from journeys single journey */}
      <Button variant="contained" onClick={handleOpen}>
        Manage Users
      </Button>
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            maxWidth: 376,
            bgcolor: 'background.paper'
          }}
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
            <Typography variant={'subtitle1'}>Invite Other Editors</Typography>
            <CloseRounded onClick={handleClose} sx={{ cursor: 'pointer' }} />
          </Box>
          <Divider />
          <Box p={6} pb={10}>
            <FormControl fullWidth>
              <FilledInput
                value={inviteLinkRef.current}
                sx={{ fontSize: theme.typography.body1.fontSize }}
                startAdornment={<LinkRounded sx={{ mr: 2 }} />}
                endAdornment={
                  <>
                    <ContentCopyRounded
                      onClick={handleCopyLinkOpen}
                      sx={{ ml: 3, cursor: 'pointer' }}
                    />

                    <Snackbar
                      open={showAlert}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right'
                      }}
                      TransitionComponent={Fade}
                      autoHideDuration={3000}
                      onClose={handleCopyLinkClose}
                      message={'Link copied to clipboard'}
                    />
                  </>
                }
                disableUnderline
                hiddenLabel
              />
            </FormControl>
            <Box ml={4} mb={4}>
              <Typography variant={'caption'}>
                Anyone with this link can see journey and ask for editing
                rights. You can accept or reject every request.
              </Typography>
            </Box>
            <Divider sx={{ my: 4 }} />

            {loading ? (
              <CircularProgress />
            ) : (
              <>
                {/* Lists out all the Requested Editing Rights */}
                <Typography variant={'body1'} gutterBottom>
                  Requested Editing Rights
                </Typography>
                {uj?.userJourneys?.map(
                  (userJourney, i) =>
                    userJourney.role === 'inviteRequested' && (
                      <UserAccess key={i} userJourney={userJourney} />
                    )
                )}

                {/* Lists out all the users with access */}
                <Divider sx={{ my: 4 }} />
                <Typography variant={'body1'} gutterBottom>
                  Users With Access
                </Typography>
                {uj?.userJourneys?.map(
                  (userJourney, i) =>
                    userJourney.role !== 'inviteRequested' && (
                      <UserAccess key={i} userJourney={userJourney} />
                    )
                )}
              </>
            )}
          </Box>
        </Box>
      </Modal>
    </>
  )
}

interface UserAccessProps {
  userJourney: UserJourneys
}

export const UserAccess = ({ userJourney }: UserAccessProps): ReactElement => {
  const [open, setOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleClick = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget)
    setOpen(true)
  }

  return (
    <Box
      key={userJourney.user?.id}
      sx={{
        display: 'flex',
        alignItems: 'center',
        pt: 2
      }}
    >
      <Avatar src={userJourney.user?.imageUrl as string} />
      <Box
        sx={{
          ml: 4,
          overflow: 'hidden'
        }}
      >
        <Typography variant={'body2'}>
          {`
            ${userJourney.user?.firstName as string} 
            ${userJourney.user?.lastName as string}
          `}
        </Typography>
        <Typography variant="caption">{userJourney.user?.email}</Typography>
      </Box>
      <Box
        sx={{
          ml: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end'
        }}
      >
        <ClickAwayListener onClickAway={() => setOpen(false)}>
          <Box
            onClick={handleClick}
            sx={{
              display: 'flex',
              cursor: 'pointer',
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            <Typography variant={'body2'}>
              {userJourney.role === 'inviteRequested'
                ? 'Manage'
                : userJourney.role.replace(/^\w/, (c) => c.toUpperCase())}
            </Typography>
            {userJourney.role === 'owner' ? (
              ''
            ) : (
              <ArrowDropDown fontSize={'medium'} sx={{ pl: 1 }} />
            )}
          </Box>
        </ClickAwayListener>
        <Menu
          id="demo-customized-menu"
          MenuListProps={{
            'aria-labelledby': 'demo-customized-button'
          }}
          anchorEl={anchorEl}
          open={open}
        >
          {userJourney.role === 'inviteRequested' ? (
            <ApproveUser userJourney={userJourney} />
          ) : (
            <PromoteUser userJourney={userJourney} />
          )}
          <Divider />
          <RemoveUser userJourney={userJourney} />
        </Menu>
      </Box>
    </Box>
  )
}
