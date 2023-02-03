import { ReactElement, MouseEvent, useEffect, useState } from 'react'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import DraftsIcon from '@mui/icons-material/Drafts'
import LinkIcon from '@mui/icons-material/Link'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import GroupAddIcon from '@mui/icons-material/GroupAdd'
import { gql, useLazyQuery, useQuery } from '@apollo/client'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Theme } from '@mui/material/styles'
import { CopyTextField } from '@core/shared/ui/CopyTextField'
import { Dialog } from '@core/shared/ui/Dialog'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import {
  GetJourneyWithUserJourneys,
  GetJourneyWithUserJourneys_journey_userJourneys as UserJourney
} from '../../../__generated__/GetJourneyWithUserJourneys'
import { UserJourneyRole } from '../../../__generated__/globalTypes'
import { GetCurrentUser } from '../../../__generated__/GetCurrentUser'
import { EmailInviteForm } from '../EmailInviteForm'
import { UserJourneyList } from './UserJourneyList'

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
  const [selectedInviteMethod, setSelectedInviteMethod] = useState('Email')
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const menuOpen = Boolean(anchorEl)

  const handleClick = (event: MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget)
  }
  const handleMenuItemClick = (
    event: MouseEvent<HTMLElement>,
    name: string
  ): void => {
    setAnchorEl(null)
    setSelectedInviteMethod(name)
  }
  const handleClose = (event: MouseEvent<HTMLElement>): void => {
    setAnchorEl(null)
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

  const usersList: UserJourney[] = []
  const requestsList: UserJourney[] = []

  data?.journey?.userJourneys?.forEach((userJourney) => {
    if (userJourney.role === UserJourneyRole.inviteRequested) {
      requestsList.push(userJourney)
    } else {
      usersList.push(userJourney)
    }
  })

  useEffect(() => {
    if (open === true) {
      void loadJourney()
    }
  }, [open, loadJourney])

  return (
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
      <Stack spacing={4}>
        <UserJourneyList
          title="Requested Editing Rights"
          userJourneys={requestsList}
          disable={disable}
        />
        <UserJourneyList
          title="Users With Access"
          loading={loading}
          userJourneys={usersList}
          disable={disable}
        />
        <Stack
          direction="row"
          alignItems="center"
          sx={{
            mb: 4,
            mt: 5
          }}
        >
          <GroupAddIcon />
          <Typography
            variant="subtitle1"
            sx={{
              marginLeft: 3
            }}
          >
            Add new using
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={
              selectedInviteMethod === 'Email' ? <DraftsIcon /> : <LinkIcon />
            }
            endIcon={<KeyboardArrowDownIcon />}
            aria-controls={menuOpen ? 'menu' : undefined}
            sx={{
              borderRadius: '16px',
              width: '124px',
              height: '32px',
              color: '#26262E',
              border: '1px solid #DEDFE0',
              padding: 1,
              marginLeft: 3,
              '&:hover': {
                borderColor: 'gray'
              }
            }}
            onClick={handleClick}
          >
            <Typography variant="body2">{selectedInviteMethod}</Typography>
          </Button>
          <Menu
            id="menu"
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleClose}
          >
            <MenuItem onClick={(e) => handleMenuItemClick(e, 'Email')}>
              Email
            </MenuItem>
            <MenuItem onClick={(e) => handleMenuItemClick(e, 'Link')}>
              Link
            </MenuItem>
          </Menu>
        </Stack>

        {selectedInviteMethod === 'Email' ? (
          <EmailInviteForm />
        ) : (
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
            helperText="Approval required for every user who clicks on the link."
          />
        )}
      </Stack>
    </Dialog>
  )
}
