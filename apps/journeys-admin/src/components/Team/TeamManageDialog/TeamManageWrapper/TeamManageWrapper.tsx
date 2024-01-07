import { ReactElement, ReactNode, useEffect, useMemo } from 'react'

import {
  GetUserTeamsAndInvites,
  GetUserTeamsAndInvites_userTeams as UserTeam
} from '../../../../../__generated__/GetUserTeamsAndInvites'
import { UserTeamRole } from '../../../../../__generated__/globalTypes'
import { useCurrentUserLazyQuery } from '../../../../libs/useCurrentUserLazyQuery'
import { useUserTeamsAndInvitesLazyQuery } from '../../../../libs/useUserTeamsAndInvitesLazyQuery'
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
  const { loadUser, data: currentUser } = useCurrentUserLazyQuery()
  const {
    query: [getUserTeamsAndInvites, { data, loading, refetch }],
    emails
  } = useUserTeamsAndInvitesLazyQuery()

  useEffect(() => {
    void loadUser()
  }, [loadUser])

  useEffect(() => {
    if (activeTeam != null) {
      void getUserTeamsAndInvites({
        variables: {
          teamId: activeTeam.id,
          where: { role: [UserTeamRole.manager, UserTeamRole.member] }
        }
      })
    }
  }, [activeTeam, getUserTeamsAndInvites])

  const currentUserTeam: UserTeam | undefined = useMemo(() => {
    return data?.userTeams?.find(({ user: { email } }) => {
      return email === currentUser?.email
    })
  }, [data, currentUser])

  const handleTeamDataChange = async (): Promise<void> => {
    await refetch()
  }

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
          <UserTeamInviteForm
            emails={emails}
            role={currentUserTeam?.role}
            handleTeamDataChange={handleTeamDataChange}
          />
        )
      })}
    </>
  )
}
