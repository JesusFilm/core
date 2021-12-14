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
  Menu
} from '@mui/material'
import {
  ArrowDropDown,
  CloseRounded,
  ContentCopyRounded,
  LinkRounded
} from '@mui/icons-material'
import {
  GetJourney_journey_usersJourneys as UsersJourneys,
  GetJourney_journey as Journey
} from '../../../__generated__/GetJourney'
import { RemoveUser } from './RemoveUser'
import { ApproveUser } from './ApproveUser'
import { PromoteUser } from './PromoteUser'

interface InviteUserModalProps {
  journey: Journey
  usersJourneys: UsersJourneys[] | undefined
}

export const InviteUserModal = ({
  usersJourneys,
  journey
}: InviteUserModalProps): ReactElement => {
  const [open, setOpen] = useState(false)
  const handleOpen = (): void => setOpen(true)
  const handleClose = (): void => setOpen(false)
  const theme = useTheme()

  // https://nextsteps.is/journeys/${journey.slug}/invite suggested link structure in figma
  const [showAlert, setShowAlert] = useState(false)
  const inviteLinkRef = useRef<string>()

  useEffect(() => {
    inviteLinkRef.current = `${window.location.origin}/journeys/${journey.slug}/invite`
  })

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
            <CloseRounded
              onClick={handleClose}
              sx={{ '&:hover': { cursor: 'pointer' } }}
            />
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
                      sx={{ ml: 3, '&:hover': { cursor: 'pointer' } }}
                    />

                    <Snackbar
                      open={showAlert}
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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

            {/* Lists out all the Requested Editing Rights */}
            <Typography variant={'body1'} gutterBottom>
              Requested Editing Rights
            </Typography>
            {usersJourneys?.map(
              (userJourney) =>
                userJourney.role === 'inviteRequested' && (
                  <Users userJourney={userJourney} />
                )
            )}

            {/* Lists out all the users with access */}
            <Divider sx={{ my: 4 }} />
            <Typography variant={'body1'} gutterBottom>
              Users With Access
            </Typography>
            {usersJourneys?.map(
              (userJourney) =>
                userJourney.role !== 'inviteRequested' && (
                  <Users userJourney={userJourney} />
                )
            )}
          </Box>
        </Box>
      </Modal>
    </>
  )
}

interface UsersProps {
  userJourney: UsersJourneys
}

export const Users = ({ userJourney }: UsersProps): ReactElement => {
  const [open, setOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const handleClick = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget)
    setOpen(true)
  }
  const handleClose = (): void => setOpen(false)

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
        <Box
          onClick={handleClick}
          sx={{
            display: 'flex',
            '&:hover': { cursor: 'pointer' },
            flexDirection: 'row',
            alignItems: 'center'
          }}
        >
          <Typography variant={'body2'}>
            {userJourney.role === 'inviteRequested'
              ? 'Manage'
              : userJourney.role.replace(/^\w/, (c) => c.toUpperCase())}
          </Typography>
          <ArrowDropDown fontSize={'medium'} sx={{ pl: 1 }} />
        </Box>
        <Menu
          id="demo-customized-menu"
          MenuListProps={{
            'aria-labelledby': 'demo-customized-button'
          }}
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
        >
          {userJourney.role === 'inviteRequested' ? (
            <ApproveUser usersJourneys={userJourney} />
          ) : (
            <PromoteUser usersJourneys={userJourney} />
          )}
          <Divider />
          <RemoveUser usersJourneys={userJourney} />
        </Menu>
      </Box>
    </Box>
  )
}
