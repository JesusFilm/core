import { ReactElement, useState } from 'react'
import {
  Button,
  Modal,
  Box,
  Avatar,
  Typography,
  Divider,
  FilledInput,
  FormControl,
  Select,
  Snackbar,
  Fade,
  useTheme,
  InputLabel
} from '@mui/material'
import { ContentCopyRounded, LinkRounded } from '@mui/icons-material'
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
  const inviteLink = `${window.location.origin}/journeys/${journey.slug}/invite`
  const [showAlert, setShowAlert] = useState(false)

  const handleCopyLinkOpen = async (): Promise<void> => {
    await navigator.clipboard.writeText(inviteLink)
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
        Invite
      </Button>
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            maxWidth: {
              xs: 200,
              sm: 300,
              md: 320,
              lg: 376
            },
            bgcolor: 'background.paper'
          }}
        >
          <Box
            sx={{
              mx: 3,
              my: 1
            }}
          >
            <Typography variant={'subtitle1'}>Invite Other Editors</Typography>
          </Box>
          <Divider />
          <Box p={3}>
            <FormControl fullWidth>
              <FilledInput
                value={inviteLink}
                sx={{ fontSize: theme.typography.body1.fontSize }}
                startAdornment={<LinkRounded sx={{ mr: 1 }} />}
                endAdornment={
                  <>
                    <ContentCopyRounded
                      onClick={handleCopyLinkOpen}
                      sx={{ ml: 1, '&:hover': { cursor: 'pointer' } }}
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
            <Box ml={2}>
              <Typography variant={'caption'}>
                Anyone with this link can see journey and ask for editing
                rights. You can accept or reject every request.
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />

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
            <Divider sx={{ my: 2 }} />
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
  return (
    <Box
      key={userJourney.user?.id}
      sx={{
        display: 'flex',
        alignItems: 'center',
        pt: 1
      }}
    >
      <Avatar src={userJourney.user?.imageUrl as string} />
      <Box
        sx={{
          ml: 2,
          overflow: 'hidden'
        }}
      >
        <Typography variant={'body2'}>
          {`
            ${userJourney.user?.firstName as string} 
            ${userJourney.user?.lastName as string}
          `}
        </Typography>
        <Typography variant={'caption'}>{userJourney.user?.email}</Typography>
      </Box>
      <Box
        sx={{
          ml: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end'
        }}
      >
        <InputLabel
          disableAnimation
          shrink={false}
          focused={false}
          sx={{ pr: 0.2 }}
        >
          {userJourney.role === 'inviteRequested'
            ? 'Manage'
            : userJourney.role.replace(/^\w/, (c) => c.toUpperCase())}
        </InputLabel>
        <Select variant="standard" disableUnderline>
          {userJourney.role === 'inviteRequested' ? (
            <ApproveUser usersJourneys={userJourney} />
          ) : (
            <PromoteUser usersJourneys={userJourney} />
          )}
          <Divider />
          <RemoveUser usersJourneys={userJourney} />
        </Select>
      </Box>
    </Box>
  )
}
