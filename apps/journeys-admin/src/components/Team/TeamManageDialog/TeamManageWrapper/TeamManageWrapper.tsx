import { ReactElement, ReactNode, useEffect, useMemo } from 'react'

import {
  GetUserTeamsAndInvites,
  GetUserTeamsAndInvites_userTeams as UserTeam
} from '../../../../../__generated__/GetUserTeamsAndInvites'
import { UserTeamRole } from '../../../../../__generated__/globalTypes'
import { useCurrentUser } from '../../../../libs/useCurrentUser'
import { useUserTeamsAndInvitesQuery } from '../../../../libs/useUserTeamsAndInvitesQuery'
import { useTeam } from '../../TeamProvider'
import { UserTeamInviteForm } from '../../UserTeamInviteForm'
import { UserTeamInviteList } from '../UserTeamInviteList'
import { UserTeamList } from '../UserTeamList'

interface TeamManageWrapperProps {
  children: (props: {
    data?: GetUserTeamsAndInvites
    userTeamList: ReactElement
    userTeamInviteList: ReactElement
    userTeamInviteForm: ReactElement
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
          teamId: activeTeam.id,
          where: { role: [UserTeamRole.manager, UserTeamRole.member] }
        }
      : undefined
  )

  useEffect(() => {
    void loadUser()
  }, [loadUser])

  const currentUserTeam: UserTeam | undefined = useMemo(() => {
    return data?.userTeams?.find(({ user: { email } }) => {
      return email === currentUser?.email
    })
  }, [data, currentUser])

  return (
    <>
      {children({
        data,
        userTeamList: (
          <UserTeamList
            data={data}
            currentUserTeam={currentUserTeam}
            loading={loading}
          />
        ),
        userTeamInviteList: (
          <UserTeamInviteList data={data} currentUserTeam={currentUserTeam} />
        ),
        userTeamInviteForm: (
          <UserTeamInviteForm emails={emails} role={currentUserTeam?.role} />
        )
      })}
    </>
  )
}
