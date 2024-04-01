import { UserTeamRole } from '.prisma/api-journeys-client'

import { Action, AppAclFn, AppAclParameters } from '../../lib/casl/caslFactory'

export const customDomainAcl: AppAclFn = ({ can, user }: AppAclParameters) => {
  // custom domain as a team manager
  can([Action.Create, Action.Update, Action.Manage], 'CustomDomain', {
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
  })
}
