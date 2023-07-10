import { ReactElement, useEffect, useMemo } from 'react'
import { UserTeamInviteListItem } from '../UserTeamInviteListItem'
import { useUserTeamsAndInvitesQuery } from '../../../../libs/useUserTeamsAndInvitesQuery'
import { useTeam } from '../../TeamProvider'
import { useCurrentUser } from '../../../../libs/useCurrentUser'
import { GetUserTeamsAndInvites_userTeams as UserTeam } from '../../../../../__generated__/GetUserTeamsAndInvites'
import { UserTeamRole } from '../../../../../__generated__/globalTypes'

export function UserTeamInvitesList(): ReactElement {
  const { activeTeam } = useTeam()
  const { loadUser, data: currentUser } = useCurrentUser()
  const { data } = useUserTeamsAndInvitesQuery(
    activeTeam != null
      ? {
          teamId: activeTeam.id
        }
      : undefined
  )
  const currentUserTeam: UserTeam | undefined = useMemo(() => {
    return data?.userTeams?.find(({ user: { email } }) => {
      return email === currentUser?.email
    })
  }, [data, currentUser])

  useEffect(() => {
    void loadUser()
  }, [loadUser])

  return (
    <>
      {data?.userTeamInvites?.map((userTeamInvite) => {
        return (
          <UserTeamInviteListItem
            key={userTeamInvite.id}
            user={userTeamInvite}
            disabled={currentUserTeam?.role !== UserTeamRole.manager}
          />
        )
      })}
    </>
  )
}
