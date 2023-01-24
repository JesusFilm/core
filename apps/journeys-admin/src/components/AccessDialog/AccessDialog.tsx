import { ReactElement, useEffect } from 'react'
import Stack from '@mui/material/Stack'
// import List from '@mui/material/List'
// import ListItem from '@mui/material/ListItem'
import { gql, useLazyQuery, useQuery } from '@apollo/client'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Theme } from '@mui/material/styles'
import { CopyTextField } from '@core/shared/ui/CopyTextField'
import { Dialog } from '@core/shared/ui/Dialog'
import { GetJourneyWithUserJourneys } from '../../../__generated__/GetJourneyWithUserJourneys'
import { UserJourneyRole } from '../../../__generated__/globalTypes'
import { GetCurrentUser } from '../../../__generated__/GetCurrentUser'
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
      <Stack>
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
      </Stack>
    </Dialog>
  )
}
