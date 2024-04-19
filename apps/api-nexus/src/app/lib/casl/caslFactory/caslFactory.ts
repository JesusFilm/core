import { AbilityBuilder, PureAbility } from '@casl/ability'
import { Injectable } from '@nestjs/common'

import { Role } from '.prisma/api-journeys-client'
import { CaslFactory } from '@core/nest/common/CaslAuthModule'

import { channelAcl } from '../../../modules/channel/channel.acl'
import { nexusAcl } from '../../../modules/nexus/nexus.acl'
import { PrismaSubjects } from '../__generated__/prismaSubjects'
import { PrismaQuery, createPrismaAbility } from '../caslPrisma'

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
    const acls = [nexusAcl, channelAcl]
    acls.forEach((acl) => acl({ can, cannot, user }))

    return build()
  }
}
