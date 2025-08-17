import { UserJourneyRole, UserTeamRole } from '@core/prisma/journeys/client'

import { Action, AppAclFn, AppAclParameters } from '../../lib/casl/caslFactory'

export const JourneyThemeAcl: AppAclFn = ({ can, user }: AppAclParameters) => {
  // manage themes as a journey owner or editor
  can(
    [Action.Create, Action.Update, Action.Delete, Action.Manage],
    'JourneyTheme',
    {
      journey: {
        is: {
          userJourneys: {
            some: {
              userId: user.id,
              role: { in: [UserJourneyRole.owner, UserJourneyRole.editor] }
            }
          }
        }
      }
    }
  )

  // manage themes as a team manager
  can(
    [Action.Create, Action.Update, Action.Delete, Action.Manage],
    'JourneyTheme',
    {
      journey: {
        is: {
          team: {
            is: {
              userTeams: {
                some: {
                  userId: user.id,
                  role: UserTeamRole.manager
                }
              }
            }
          }
        }
      }
    }
  )
}
