import { GetCampaign_campaign as Campaign } from '../../../../__generated__/GetCampaign'
import {
  GetCurrentUser_me_AnonymousUser as AnonymousUser,
  GetCurrentUser_me_AuthenticatedUser as AuthenticatedUser
} from '../../../../__generated__/GetCurrentUser'
import { UserTeamRole } from '../../../../__generated__/globalTypes'

/**
 * The signed-in user's role on the campaign's team, as far as the editor
 * knows it: `pending` until `me` answers, `error` when it could not be read.
 * Manager-only controls show disabled for both; the server decides either way.
 */
export type CampaignRole = 'pending' | 'manager' | 'member' | 'error'

interface CampaignRoleInput {
  campaign: Pick<Campaign, 'team'>
  /** `me`, or the lazy query's fallback (an empty id) until it answers. */
  currentUser: AuthenticatedUser | AnonymousUser
  loading: boolean
  error?: unknown
}

export function campaignRoleOf({
  campaign,
  currentUser,
  loading,
  error
}: CampaignRoleInput): CampaignRole {
  if (loading) return 'pending'
  if (error != null) return 'error'
  if (currentUser.id === '') return 'pending'
  if (currentUser.__typename !== 'AuthenticatedUser') return 'member'
  // Matched by email, as CustomDomainDialog does: `me.id` is the users
  // table uuid while a UserTeam's `user.id` is the Firebase uid, so the two
  // never compare equal.
  const isManager = campaign.team.userTeams.some(
    (userTeam) =>
      userTeam.user.__typename === 'AuthenticatedUser' &&
      userTeam.user.email === currentUser.email &&
      userTeam.role === UserTeamRole.manager
  )
  return isManager ? 'manager' : 'member'
}
