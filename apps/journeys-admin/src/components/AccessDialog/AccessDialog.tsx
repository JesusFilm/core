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
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import {
  GetJourneyWithUserJourneys,
  GetJourneyWithUserJourneys_journey_userJourneys as UserJourney
} from '../../../__generated__/GetJourneyWithUserJourneys'
import { UserJourneyRole } from '../../../__generated__/globalTypes'
import { GetCurrentUser } from '../../../__generated__/GetCurrentUser'
import { EmailInviteInput } from '../EmailInviteInput'
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
      </Stack>
    </Dialog>
  )
}
