import { gql, useLazyQuery } from '@apollo/client'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { ReactElement, useEffect, useMemo } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

import {
  GetJourneyWithUserJourneys,
  GetJourneyWithUserJourneys_journey_userJourneys as UserJourney
} from '../../../__generated__/GetJourneyWithUserJourneys'
import { UserJourneyRole } from '../../../__generated__/globalTypes'
import { useCurrentUser } from '../../libs/useCurrentUser'
import { useUserInvitesLazyQuery } from '../../libs/useUserInvitesLazyQuery'

import { AddUserSection } from './AddUserSection'
import { UserList } from './UserList'

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
  const [, { loading, data, refetch }] =
    useLazyQuery<GetJourneyWithUserJourneys>(GET_JOURNEY_WITH_USER_JOURNEYS, {
      variables: { id: journeyId }
    })

  const [, { data: userInviteData, refetch: refetchInvites }] =
    useUserInvitesLazyQuery({ journeyId })

  const { loadUser, data: authUser } = useCurrentUser()

  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  const currentUser = useMemo(() => {
    return data?.journey?.userJourneys?.find(
      (userJourney) => userJourney.user?.email === authUser.email
    )
  }, [data?.journey?.userJourneys, authUser])

  const { users, requests, invites, emails } = useMemo(() => {
    const users: UserJourney[] = []
    const requests: UserJourney[] = []
    const emails: string[] = []

    data?.journey?.userJourneys?.forEach((userJourney) => {
      if (userJourney.role === UserJourneyRole.inviteRequested) {
        requests.push(userJourney)
      } else {
        users.push(userJourney)
      }
      if (userJourney.user != null) emails.push(userJourney.user.email)
    })

    const invites =
      userInviteData?.userInvites != null ? userInviteData.userInvites : []
    invites.forEach((invite) => {
      if (invite.removedAt == null && invite.acceptedAt == null) {
        emails.push(invite.email)
      }
    })

    return { users, requests, invites, emails }
  }, [data, userInviteData])

  useEffect(() => {
    if (open === true) {
      void refetch()
      void refetchInvites()
      void loadUser()
    }
  }, [open, refetch, refetchInvites, loadUser])

  return (
    <Dialog
      open={open ?? false}
      onClose={onClose}
      dialogTitle={{
        title: 'Manage Editors',
        closeButton: true
      }}
      dialogActionChildren={
        <AddUserSection users={emails} journeyId={journeyId} />
      }
      fullscreen={!smUp}
    >
      <Stack spacing={4}>
        <UserList
          title="Requested Access"
          users={requests}
          currentUser={currentUser}
          journeyId={journeyId}
        />
        <UserList
          title="Editors"
          loading={loading}
          users={users}
          invites={invites}
          currentUser={currentUser}
          journeyId={journeyId}
        />
      </Stack>
    </Dialog>
  )
}
