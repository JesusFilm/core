import { ReactElement } from 'react'
import { UserTeamList } from '../UserTeamList'
import { UserTeamInvitesList } from '../UserTeamInvitesList'
import { useTeam } from '../../TeamProvider'
import { useCurrentUser } from '../../../../libs/useCurrentUser'
import { useUserTeamsAndInvitesQuery } from '../../../../libs/useUserTeamsAndInvitesQuery'

export function TeamMembersList(): ReactElement {
  const { activeTeam } = useTeam()
  const { loadUser, data: currentUser } = useCurrentUser()
  const { data, loading } = useUserTeamsAndInvitesQuery(
    activeTeam != null
      ? {
          teamId: activeTeam.id
        }
      : undefined
  )

  return (
    <>
      <UserTeamList
        data={data}
        currentUser={currentUser}
        loadUser={loadUser}
        loading={loading}
      />
      <UserTeamInvitesList
        data={data}
        currentUser={currentUser}
        loadUser={loadUser}
      />
    </>
  )
}
