import { ReactElement, useEffect, useMemo } from 'react'
import { LazyQueryExecFunction, OperationVariables } from '@apollo/client'
import { UserTeamInviteListItem } from '../UserTeamInviteListItem'
import {
  GetUserTeamsAndInvites,
  GetUserTeamsAndInvites_userTeams as UserTeam
} from '../../../../../__generated__/GetUserTeamsAndInvites'
import { UserTeamRole } from '../../../../../__generated__/globalTypes'
import {
  GetCurrentUser,
  GetCurrentUser_me
} from '../../../../../__generated__/GetCurrentUser'

interface UserTeamInvitesListProps {
  data: GetUserTeamsAndInvites | undefined
  currentUser: GetCurrentUser_me
  loadUser: LazyQueryExecFunction<GetCurrentUser, OperationVariables>
}

export function UserTeamInvitesList({
  data,
  currentUser,
  loadUser
}: UserTeamInvitesListProps): ReactElement {
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
