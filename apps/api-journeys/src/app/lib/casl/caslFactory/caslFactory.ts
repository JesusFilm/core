import { Injectable } from '@nestjs/common'
import { PureAbility, AbilityBuilder } from '@casl/ability'
import { Role } from '.prisma/api-journeys-client'
import { CaslFactory } from '@core/nest/common/CaslAuthModule'
import { createPrismaAbility, PrismaQuery } from '../caslPrisma'
import { PrismaSubjects } from '../__generated__/prismaSubjects'
import { teamAcl } from '../../../modules/team/team.acl'
import { userTeamAcl } from '../../../modules/userTeam/userTeam.acl'
import { journeyAcl } from '../../../modules/journey/journey.acl'
import { hostAcl } from '../../../modules/host/host.acl'
import { userTeamInviteAcl } from '../../../modules/userTeamInvite/userTeamInvite.acl'
import { visitorAcl } from '../../../modules/visitor/visitor.acl'

export enum Action {
  Manage = 'manage',
  Read = 'read',
  Create = 'create',
  Update = 'update',
  Delete = 'delete'
}

type ExtendedSubjects = 'all'
export type AppSubjects = PrismaSubjects | ExtendedSubjects
export type AppAbility = PureAbility<[Action, AppSubjects], PrismaQuery>

interface User {
  id: string
  roles?: Role[]
}
export interface AppAclParameters {
  can: AbilityBuilder<AppAbility>['can']
  cannot: AbilityBuilder<AppAbility>['cannot']
  user: User
}

export type AppAclFn = ({ can, cannot, user }: AppAclParameters) => void

@Injectable()
export class AppCaslFactory extends CaslFactory<Role> {
  async createAbility(user: User): Promise<AppAbility> {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      createPrismaAbility
    )
    const acls = [
      hostAcl,
      journeyAcl,
      teamAcl,
      userTeamAcl,
      userTeamInviteAcl,
      visitorAcl
    ]
    acls.forEach((acl) => acl({ can, cannot, user }))

    return build()
  }
}
