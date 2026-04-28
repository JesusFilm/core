import {
  JourneyStatus,
  Prisma,
  UserJourneyRole,
  UserTeamRole
} from '@core/prisma/journeys/client'

import { Action, AppAclFn, AppAclParameters } from '../../lib/casl/caslFactory'

export const INCLUDE_JOURNEY_ACL: Prisma.BlockInclude = {
  journey: {
    include: {
      team: { include: { userTeams: true } },
      userJourneys: true
    }
  }
}

export const journeyAcl: AppAclFn = ({
  can,
  cannot,
  user
}: AppAclParameters) => {
  // create journey as a team member
  can(Action.Create, 'Journey', {
    team: {
      is: {
        userTeams: {
          some: {
            userId: user.id,
            role: { in: [UserTeamRole.manager, UserTeamRole.member] }
          }
        }
      }
    }
  })
  // manage journey as a team manager
  can(Action.Manage, 'Journey', {
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
  // manage journey as a journey owner
  can(Action.Manage, 'Journey', {
    userJourneys: {
      some: {
        userId: user.id,
        role: UserJourneyRole.owner
      }
    }
  })
  // read and update journey as a team member
  can([Action.Read, Action.Update], 'Journey', {
    team: {
      is: {
        userTeams: {
          some: {
            userId: user.id,
            role: UserTeamRole.member
          }
        }
      }
    }
  })
  // read and update journey as a journey editor
  can([Action.Read, Action.Update], 'Journey', {
    userJourneys: {
      some: {
        userId: user.id,
        role: UserJourneyRole.editor
      }
    }
  })
  // read published journey template
  can(Action.Read, 'Journey', {
    template: true,
    status: JourneyStatus.published
  })
  // Team members can manage unrestricted local templates
  can(Action.Manage, 'Journey', {
    template: true,
    teamId: { not: 'jfp-team' },
    restrictEditing: { not: true },
    team: {
      is: {
        userTeams: {
          some: {
            userId: user.id,
            role: UserTeamRole.member
          }
        }
      }
    }
  })
  // Journey editors can manage unrestricted local templates
  can(Action.Manage, 'Journey', {
    template: true,
    teamId: { not: 'jfp-team' },
    restrictEditing: { not: true },
    userJourneys: {
      some: {
        userId: user.id,
        role: UserJourneyRole.editor
      }
    }
  })
  // Block Update on restricted local templates (re-granted for managers and
  // journey owners below, plus publishers in the publisher block).
  cannot(Action.Update, 'Journey', {
    template: true,
    teamId: { not: 'jfp-team' },
    restrictEditing: true
  })
  // Re-grant Update on restricted local templates to team managers
  can(Action.Update, 'Journey', {
    template: true,
    teamId: { not: 'jfp-team' },
    restrictEditing: true,
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
  // Re-grant Update on restricted local templates to journey owners (the creator)
  can(Action.Update, 'Journey', {
    template: true,
    teamId: { not: 'jfp-team' },
    restrictEditing: true,
    userJourneys: {
      some: {
        userId: user.id,
        role: UserJourneyRole.owner
      }
    }
  })
  cannot(Action.Manage, 'Journey', 'template')
  // Team managers/members can manage template field for unrestricted local templates
  can(Action.Manage, 'Journey', 'template', {
    template: true,
    teamId: { not: 'jfp-team' },
    restrictEditing: { not: true },
    team: {
      is: {
        userTeams: {
          some: {
            userId: user.id,
            role: { in: [UserTeamRole.manager, UserTeamRole.member] }
          }
        }
      }
    }
  })
  // Journey owners/editors can manage template field for unrestricted local templates
  can(Action.Manage, 'Journey', 'template', {
    template: true,
    teamId: { not: 'jfp-team' },
    restrictEditing: { not: true },
    userJourneys: {
      some: {
        userId: user.id,
        role: { in: [UserJourneyRole.owner, UserJourneyRole.editor] }
      }
    }
  })
  // Team managers can manage template field on restricted local templates
  can(Action.Manage, 'Journey', 'template', {
    template: true,
    teamId: { not: 'jfp-team' },
    restrictEditing: true,
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
  // Journey owners can manage template field on restricted local templates
  can(Action.Manage, 'Journey', 'template', {
    template: true,
    teamId: { not: 'jfp-team' },
    restrictEditing: true,
    userJourneys: {
      some: {
        userId: user.id,
        role: UserJourneyRole.owner
      }
    }
  })
  // Only team managers may flip the restrictEditing field, and only on team
  // (local) templates — global templates use the publisher rule instead.
  cannot(Action.Manage, 'Journey', 'restrictEditing')
  can(Action.Manage, 'Journey', 'restrictEditing', {
    template: true,
    teamId: { not: 'jfp-team' },
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
  if (user.roles?.includes('publisher') === true) {
    can(Action.Create, 'Journey', { teamId: 'jfp-team' })

    // publisher can manage template
    can(Action.Manage, 'Journey', { template: true })
    // publisher can convert journey to template as a journey owner/editor
    can(Action.Manage, 'Journey', 'template', {
      userJourneys: {
        some: {
          userId: user.id,
          role: { in: [UserJourneyRole.owner, UserJourneyRole.editor] }
        }
      }
    })
    // publisher can convert journey to template as a team manager/member
    can(Action.Manage, 'Journey', 'template', {
      team: {
        is: {
          userTeams: {
            some: {
              userId: user.id,
              role: { in: [UserTeamRole.manager, UserTeamRole.member] }
            }
          }
        }
      }
    })
  }
}
