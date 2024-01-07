import { ReactElement } from 'react'

import {
  GetUserTeamsAndInvites,
  GetUserTeamsAndInvites_userTeams as UserTeam
} from '../../../../../__generated__/GetUserTeamsAndInvites'
import { UserTeamRole } from '../../../../../__generated__/globalTypes'

import { UserTeamInviteListItem } from './UserTeamInviteListItem'

interface UserTeamInvitesListProps {
  data: GetUserTeamsAndInvites | undefined
  currentUserTeam: UserTeam | undefined
  handleTeamDataChange: () => Promise<void>
}

export function UserTeamInviteList({
  data,
  currentUserTeam,
  handleTeamDataChange
}: UserTeamInvitesListProps): ReactElement {
  return (
    <>
      {data?.userTeamInvites?.map((userTeamInvite) => {
        return (
          <UserTeamInviteListItem
            key={userTeamInvite.id}
            user={userTeamInvite}
            disabled={currentUserTeam?.role !== UserTeamRole.manager}
            handleTeamDataChange={handleTeamDataChange}
          />
        )
      })}
    </>
  )
}
