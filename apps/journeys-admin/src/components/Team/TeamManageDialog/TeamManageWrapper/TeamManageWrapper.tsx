import { ReactElement, ReactNode } from 'react'
import { UserTeamList } from '../UserTeamList'
import { UserTeamInvitesList } from '../UserTeamInvitesList'
import { useTeam } from '../../TeamProvider'
import { useCurrentUser } from '../../../../libs/useCurrentUser'
import { useUserTeamsAndInvitesQuery } from '../../../../libs/useUserTeamsAndInvitesQuery'
import { UserTeamInviteForm } from '../../UserTeamInviteForm'
import { GetUserTeamsAndInvites } from '../../../../../__generated__/GetUserTeamsAndInvites'

interface TeamManageWrapperProps {
  children: (props: {
    data?: GetUserTeamsAndInvites
    UserTeamList: ReactElement
    UserTeamInviteList: ReactElement
    UserTeamInviteForm: ReactElement
  }) => ReactNode
}

export function TeamManageWrapper({
  children
}: TeamManageWrapperProps): ReactElement {
  const { activeTeam } = useTeam()
  const { loadUser, data: currentUser } = useCurrentUser()
  const { data, loading, emails } = useUserTeamsAndInvitesQuery(
    activeTeam != null
      ? {
          teamId: activeTeam.id
        }
      : undefined
  )

  return (
    <>
      {children({
        data,
        UserTeamList: (
          <UserTeamList
            data={data}
            currentUser={currentUser}
            loadUser={loadUser}
            loading={loading}
          />
        ),
        UserTeamInviteList: (
          <UserTeamInvitesList
            data={data}
            currentUser={currentUser}
            loadUser={loadUser}
          />
        ),
        UserTeamInviteForm: <UserTeamInviteForm emails={emails} />
      })}
    </>
  )
}
