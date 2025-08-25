import { UserJourneyRole, UserTeamRole } from '@core/prisma/journeys/client'

import { Action, AppAclFn, AppAclParameters } from '../../lib/casl/caslFactory'

export const userJourneyAcl: AppAclFn = ({ can, user }: AppAclParameters) => {
  // create userJourney invite request as a user
  can(Action.Create, 'UserJourney', {
    userId: user.id,
    role: UserJourneyRole.inviteRequested
  })
  // read userJourney as a team member
  can(Action.Read, 'UserJourney', {
    journey: {
      is: {
        team: {
          is: {
            userTeams: {
              some: {
                userId: user.id,
                role: {
                  in: [UserTeamRole.manager, UserTeamRole.member]
                }
              }
            }
          }
        }
      }
    }
  })
  // read userJourney as a journey editor
  can(Action.Read, 'UserJourney', {
    journey: {
      is: {
        userJourneys: {
          some: {
            userId: user.id,
            role: {
              in: [UserJourneyRole.owner, UserJourneyRole.editor]
            }
          }
        }
      }
    }
  })
  // delete userJourney as a team manager
  can(Action.Delete, 'UserJourney', {
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
  })
  // delete userJourney as a journey owner
  can(Action.Delete, 'UserJourney', {
    journey: {
      is: {
        userJourneys: {
          some: {
            userId: user.id,
            role: UserJourneyRole.owner
          }
        }
      }
    }
  })
  // update userJourney role as a team manager
  can(Action.Update, 'UserJourney', 'role', {
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
  })
  // update userJourney role as a journey owner
  can(Action.Update, 'UserJourney', 'role', {
    journey: {
      is: {
        userJourneys: {
          some: {
            userId: user.id,
            role: UserJourneyRole.owner
          }
        }
      }
    }
  })
  // update userJourney openedAt as a user
  can(Action.Update, 'UserJourney', 'openedAt', {
    userId: user.id
  })
}
