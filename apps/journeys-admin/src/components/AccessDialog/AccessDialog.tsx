import { gql, useLazyQuery } from '@apollo/client'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useMemo } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

import {
  GetJourneyWithPermissions,
  GetJourneyWithPermissions_journey_userJourneys as UserJourney,
  GetJourneyWithPermissions_journey_team_userTeams as UserTeam
} from '../../../__generated__/GetJourneyWithPermissions'
import { UserJourneyRole } from '../../../__generated__/globalTypes'
import { useCurrentUserLazyQuery } from '../../libs/useCurrentUserLazyQuery'
import { useUserInvitesLazyQuery } from '../../libs/useUserInvitesLazyQuery'
import { UserTeamList } from '../Team/TeamManageDialog/UserTeamList'

import { AddUserSection } from './AddUserSection'
import { UserList } from './UserList'
import { TeamMembersHeading } from './TeamMembersHeading/TeamMembersHeading'

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
          journeyNotification(journeyId: $id) {
            id
            visitorInteractionEmail
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
        journeyNotification {
          id
          visitorInteractionEmail
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

  const { loadUser, data: user } = useCurrentUserLazyQuery()

  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  const currentUserJourney = useMemo(() => {
    return data?.journey?.userJourneys?.find(
      (userJourney) => userJourney.user?.email === user.email
    )
  }, [data?.journey?.userJourneys, user])

  const currentUserTeam: UserTeam | undefined = useMemo(() => {
    return data?.journey?.team?.userTeams.find(({ user: { email } }) => {
      return email === user?.email
    })
  }, [data?.journey?.team?.userTeams, user])

  const userTeamsMap = useMemo(() => {
    return new Map(
      data?.journey.team?.userTeams.map((obj) => [obj.user.id, obj])
    )
  }, [data?.journey?.team?.userTeams])

  const { users, requests, invites, emails } = useMemo(() => {
    const users: UserJourney[] = []
    const requests: UserJourney[] = []
    const emails: string[] = []

    data?.journey?.userJourneys?.forEach((userJourney) => {
      if (userJourney.role === UserJourneyRole.inviteRequested) {
        requests.push(userJourney)
      } else {
        // if user is already part of user team, don't display their user journey
        if (userTeamsMap.get(userJourney?.user?.id ?? '') == null)
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
  }, [data, userInviteData, userTeamsMap])

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
      testId="AccessDialog"
    >
      <Stack spacing={4}>
        <TeamMembersHeading
          teamMembersText={t('Team Members')}
          emailNotificationsText={t('Email Notifications')}
          userRoleText={t('User Role')}
        />

        {data?.journey?.team?.userTeams != null &&
          data?.journey?.team?.userTeams.length > 0 && (
            <>
              <UserTeamList
                data={data?.journey?.team ?? undefined}
                currentUserTeam={currentUserTeam}
                loading={loading}
                variant="readonly"
                journeyId={journeyId}
              />
            </>
          )}
        <UserList
          title={t('Requested Access')}
          users={requests}
          currentUser={currentUserJourney}
          journeyId={journeyId}
        />
        <UserList
          title={t('Guests')}
          loading={loading}
          users={users}
          invites={invites}
          currentUser={currentUserJourney}
          journeyId={journeyId}
        />
      </Stack>
    </Dialog>
  )
}
