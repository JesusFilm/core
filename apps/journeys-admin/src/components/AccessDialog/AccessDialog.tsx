import { gql, useLazyQuery } from '@apollo/client'
import EmailIcon from '@mui/icons-material/Email'
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import Grid from '@mui/material/Grid'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useMemo } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

import { GetEventEmailNotifications_eventEmailNotificationsByJourney as EventEmailNotifications } from '../../../__generated__/GetEventEmailNotifications'
import {
  GetJourneyWithPermissions,
  GetJourneyWithPermissions_journey_userJourneys as UserJourney
} from '../../../__generated__/GetJourneyWithPermissions'
import { GetUserTeamsAndInvites_userTeams as UserTeam } from '../../../__generated__/GetUserTeamsAndInvites'
import { UserJourneyRole } from '../../../__generated__/globalTypes'
import { useCurrentUserLazyQuery } from '../../libs/useCurrentUserLazyQuery'
import { useEventEmailNotificationsLazyQuery } from '../../libs/useEventEmailNotificationsLazyQuery'
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

  const { loadUser, data: user } = useCurrentUserLazyQuery()
  const [, { data: emailPreferences, refetch: loadEmailPreferences }] =
    useEventEmailNotificationsLazyQuery(journeyId)

  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  const currentUser = useMemo(() => {
    return data?.journey?.userJourneys?.find(
      (userJourney) => userJourney.user?.email === user.email
    )
  }, [data?.journey?.userJourneys, user])

  const emailPreferencesMap: Map<string, EventEmailNotifications> =
    useMemo(() => {
      return new Map(
        emailPreferences?.eventEmailNotificationsByJourney.map((obj) => [
          obj.userId,
          obj
        ])
      )
    }, [emailPreferences])

  const { users, requests, invites, emails } = useMemo(() => {
    const userTeamsMap = new Map(
      data?.journey.team?.userTeams.map((obj) => [obj.user.id, obj])
    )
    const users: UserJourney[] = []
    const requests: UserJourney[] = []
    const emails: string[] = []

    data?.journey?.userJourneys?.forEach((userJourney) => {
      if (userJourney.role === UserJourneyRole.inviteRequested) {
        requests.push(userJourney)
      } else {
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
  }, [data, userInviteData])

  useEffect(() => {
    if (open === true) {
      void refetch()
      void refetchInvites()
      void loadUser()
      void loadEmailPreferences()
    }
  }, [open, refetch, refetchInvites, loadUser, loadEmailPreferences])

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
        {data?.journey?.team?.userTeams != null &&
          data?.journey?.team?.userTeams.length > 0 && (
            <>
              {/* TODO: move MUI icons to Stratis */}
              <Grid container spacing={1} alignItems="center">
                <Grid xs={2} sm={1}>
                  <Stack sx={{ ml: 1 }}>
                    <PeopleAltIcon />
                  </Stack>
                </Grid>
                <Grid xs={5} sm={7}>
                  <ListItemText primary={t('Team Members')} sx={{ ml: 2 }} />
                </Grid>
                <Grid xs={2} sm={2}>
                  <Stack sx={{ ml: 4 }}>
                    <EmailIcon />
                  </Stack>
                </Grid>
                <Grid xs={3} sm={2}>
                  <Stack sx={{ ml: 5 }}>
                    <VerifiedUserIcon />
                  </Stack>
                </Grid>
              </Grid>
              <UserTeamList
                data={data?.journey?.team ?? undefined}
                currentUserTeam={data?.journey?.team as unknown as UserTeam}
                loading={loading}
                variant="readonly"
                emailPreferences={emailPreferencesMap}
                journeyId={journeyId}
              />
            </>
          )}
        <UserList
          title={t('Requested Access')}
          users={requests}
          currentUser={currentUser}
          journeyId={journeyId}
        />
        <UserList
          title={t('Guests')}
          loading={loading}
          users={users}
          invites={invites}
          currentUser={currentUser}
          journeyId={journeyId}
          emailPreferences={emailPreferencesMap}
        />
      </Stack>
    </Dialog>
  )
}
