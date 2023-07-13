import { ReactElement, ReactNode, useEffect, useMemo } from 'react'
import { UserTeamList } from '../UserTeamList'
import { UserTeamInvitesList } from '../UserTeamInvitesList'
import { useTeam } from '../../TeamProvider'
import { useCurrentUser } from '../../../../libs/useCurrentUser'
import { useUserTeamsAndInvitesQuery } from '../../../../libs/useUserTeamsAndInvitesQuery'
import { UserTeamInviteForm } from '../../UserTeamInviteForm'
import {
  GetUserTeamsAndInvites,
  GetUserTeamsAndInvites_userTeams as UserTeam
} from '../../../../../__generated__/GetUserTeamsAndInvites'

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
          teamId: activeTeam.id
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
          <UserTeamInvitesList data={data} currentUserTeam={currentUserTeam} />
        ),
        userTeamInviteForm: <UserTeamInviteForm emails={emails} />
      })}
    </>
  )
}
