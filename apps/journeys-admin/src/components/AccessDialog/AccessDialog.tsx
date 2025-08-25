import { gql, useLazyQuery } from '@apollo/client'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

import {
  GetJourneyWithPermissions,
} from '../../../__generated__/GetJourneyWithPermissions'
import { useCurrentUserLazyQuery } from '../../libs/useCurrentUserLazyQuery'
import { useUserInvitesLazyQuery } from '../../libs/useUserInvitesLazyQuery'
import { UserTeamList } from '../Team/TeamManageDialog/UserTeamList'

import { AddUserSection } from './AddUserSection'
import { UserList } from './UserList'
import { TeamMembersHeading } from './TeamMembersHeading/TeamMembersHeading'
import { useAccessDialogData } from '../../libs/useAccessDialogData/useAccessDialogData'

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

export function AccessDialog({ journeyId, open, onClose }: AccessDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  // Data fetching
  const [, { loading, data, refetch }] = useLazyQuery<GetJourneyWithPermissions>(
    GET_JOURNEY_WITH_PERMISSIONS,
    { variables: { id: journeyId } }
  )

  const [, { data: userInviteData, refetch: refetchInvites }] = useUserInvitesLazyQuery({ 
    journeyId 
  })

  const { loadUser, data: user } = useCurrentUserLazyQuery()

  // Process data
  const processedData = useAccessDialogData(data, userInviteData, user?.email)

  useEffect(() => {
    if (open) {
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
        <AddUserSection users={processedData.allEmails} journeyId={journeyId} />
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

        {processedData.enhancedTeamData?.userTeams?.length && (
          <UserTeamList
            data={processedData.enhancedTeamData}
            currentUserTeam={processedData.currentUserTeam}
            loading={loading}
            variant="readonly"
            journeyId={journeyId}
          />
        )}
        <UserList
          title={t('Requested Access')}
          users={processedData.pendingRequests}
          currentUser={processedData.currentUserJourney}
          journeyId={journeyId}
        />
        <UserList
          title={t('Guests')}
          loading={loading}
          users={processedData.guestUsers}
          invites={processedData.pendingInvites}
          currentUser={processedData.currentUserJourney}
          journeyId={journeyId}
        />
      </Stack>
    </Dialog>
  )
}
