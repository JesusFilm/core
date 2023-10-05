import { gql, useLazyQuery } from '@apollo/client'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { ReactElement, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { Dialog } from '@core/shared/ui/Dialog'

import {
  GetJourneyWithPermissions,
  GetJourneyWithPermissions_journey_userJourneys as UserJourney
} from '../../../__generated__/GetJourneyWithPermissions'
import { GetUserTeamsAndInvites_userTeams as UserTeam } from '../../../__generated__/GetUserTeamsAndInvites'
import { UserJourneyRole } from '../../../__generated__/globalTypes'
import { useCurrentUser } from '../../libs/useCurrentUser'
import { useUserInvitesLazyQuery } from '../../libs/useUserInvitesLazyQuery'
import { UserTeamList } from '../Team/TeamManageDialog/UserTeamList'

import { AddUserSection } from './AddUserSection'
import { UserList } from './UserList'

export const GET_JOURNEY_WITH_PERMISSIONS = gql`
  query GetJourneyWithPermissions($id: ID!) {
    journey: adminJourney(id: $id, idType: databaseId) {
      id
      team {
        id
        userTeams {
          id
          role
          user {
            email
            firstName
            id
            imageUrl
            lastName
          }
        }
      }
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
  const { t } = useTranslation('apps-journeys-admin')
  const [, { loading, data, refetch }] =
    useLazyQuery<GetJourneyWithPermissions>(GET_JOURNEY_WITH_PERMISSIONS, {
      variables: { id: journeyId }
    })

  const [, { data: userInviteData, refetch: refetchInvites }] =
    useUserInvitesLazyQuery({ journeyId })

  const { loadUser, data: user } = useCurrentUser()

  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  const currentUser = useMemo(() => {
    return data?.journey?.userJourneys?.find(
      (userJourney) => userJourney.user?.email === user.email
    )
  }, [data?.journey?.userJourneys, user])

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
        title: t('Manage Editors'),
        closeButton: true
      }}
      dialogActionChildren={
        <AddUserSection users={emails} journeyId={journeyId} />
      }
      fullscreen={!smUp}
    >
      <Stack spacing={4}>
        {data?.journey?.team?.userTeams != null &&
          data?.journey?.team?.userTeams.length > 0 && (
            <Stack direction="row" alignItems="center" sx={{ mb: -4 }}>
              <Typography variant="subtitle1">{t('Team Members')}</Typography>
            </Stack>
          )}
        <UserTeamList
          data={data?.journey?.team ?? undefined}
          currentUserTeam={data?.journey?.team as unknown as UserTeam}
          loading={loading}
          variant="readonly"
        />
        <UserList
          title={t('Requested Access')}
          users={requests}
          currentUser={currentUser}
          journeyId={journeyId}
        />
        <UserList
          title={t('Editors')}
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
