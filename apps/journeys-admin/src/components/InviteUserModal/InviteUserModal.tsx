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
  MenuItem,
  InputLabel
} from '@mui/material'
import { ContentCopyRounded, LinkRounded } from '@mui/icons-material'
// import { InviteUserModalFields as User } from '../../../__generated__/InviteUserModalFields'
import { GetJourney_journey_usersJourneys as UsersJourneys } from '../../../__generated__/GetJourney'
import { useMutation, gql } from '@apollo/client'
import { UserJourneyRemove } from '../../../__generated__/UserJourneyRemove'

interface InviteUserModalProps {
  // users: User[]
  usersJourneys: UsersJourneys[] | undefined
}

export const USER_JOURNEY = gql`
  mutation UserJourneyRemove($input: UserJourneyRemoveInput!) {
    userJourneyRemove(input: $input) {
      userId
      journeyId
      role
    }
  }
`

export const InviteUserModal = ({
  usersJourneys
}: InviteUserModalProps): ReactElement => {
  const [open, setOpen] = useState(false)
  const handleOpen = (): void => setOpen(true)
  const handleClose = (): void => setOpen(false)
  const [userJourneyRemove] = useMutation<UserJourneyRemove>(USER_JOURNEY)

  // TODO: create a mutation library to better handle the mutations

  const handleRemoveUser = (
    userId: string,
    journeyId: string,
    role: string
  ): void => {
    void userJourneyRemove({
      variables: {
        input: {
          userId,
          journeyId,
          role
        },
        optimisticResponse: {
          userJourneyRemove: {
            userId,
            journeyId,
            role
          }
        }
      }
    })
  }

  return (
    <>
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
            width: 376,
            bgcolor: 'background.paper',
            p: 4
          }}
        >
          <Box>
            <Typography variant={'subtitle1'} gutterBottom>
              Invite Other Editors
            </Typography>
            <Divider sx={{ mt: 2, mb: 3 }} />
            <FormControl fullWidth>
              {/* This is where the invite link goes */}
              <FilledInput
                placeholder="this is where the invite link goes"
                startAdornment={<LinkRounded />}
                endAdornment={<ContentCopyRounded />}
                disableUnderline
              />
            </FormControl>
            <Typography variant={'caption'}>
              Anyone with this link can see journey and ask for editing rights.
              You can accept or reject every request
            </Typography>
            <Divider sx={{ my: 2 }} />

            {/* Lists out all the Requested Editing Rights */}
            <Typography variant={'body1'} gutterBottom>
              Requested Editing Rights
            </Typography>
            {usersJourneys?.map(
              (userJourney) =>
                userJourney.role === 'inviteRequested' && (
                  <Box
                    key={userJourney.user?.id}
                    display="flex"
                    alignItems="center"
                    sx={{ mt: 2, display: 'flex', flexDirection: 'row' }}
                  >
                    <Avatar src={userJourney.user?.imageUrl as string} />
                    <Box ml={2}>
                      <Typography variant={'body2'}>{`${
                        userJourney.user?.firstName as string
                      } ${userJourney.user?.lastName as string}`}</Typography>
                      <Typography variant={'caption'}>
                        {userJourney.user?.email}
                      </Typography>
                    </Box>
                    <FormControl fullWidth sx={{ maxWidth: 93, width: 93 }}>
                      <InputLabel>Manage</InputLabel>
                      <Select variant="standard" disableUnderline>
                        <MenuItem>Approve</MenuItem>
                        <Divider />
                        <MenuItem
                          onClick={() =>
                            handleRemoveUser(
                              userJourney.userId,
                              userJourney.journeyId,
                              userJourney.role
                            )
                          }
                        >
                          Remove
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
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
                  <Box
                    key={userJourney.user?.id}
                    display="flex"
                    alignItems="center"
                  >
                    <Avatar src={userJourney.user?.imageUrl as string} />
                    <Box ml={2}>
                      <Typography variant={'body2'}>{`${
                        userJourney.user?.firstName as string
                      } ${userJourney.user?.lastName as string}`}</Typography>
                      <Typography variant={'caption'}>
                        {userJourney.user?.email}
                      </Typography>
                    </Box>
                    <FormControl fullWidth sx={{ maxWidth: 93, width: 93 }}>
                      <InputLabel>{userJourney.role}</InputLabel>
                      <Select variant="standard" disableUnderline>
                        <MenuItem>Approve</MenuItem>
                        <Divider />
                        <MenuItem
                          onClick={() =>
                            handleRemoveUser(
                              userJourney.userId,
                              userJourney.journeyId,
                              userJourney.role
                            )
                          }
                        >
                          Remove
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                )
            )}
          </Box>
        </Box>
      </Modal>
    </>
  )
}
