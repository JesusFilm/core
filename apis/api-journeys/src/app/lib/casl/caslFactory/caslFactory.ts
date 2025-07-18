import { AbilityBuilder, PureAbility } from '@casl/ability'
import { Injectable } from '@nestjs/common'

import { CaslFactory } from '@core/nest/common/CaslAuthModule'
import { Role } from '@core/prisma-journeys/client'

import { blockAcl } from '../../../modules/block/block.acl'
import { customDomainAcl } from '../../../modules/customDomain/customDomain.acl'
import { eventAcl } from '../../../modules/event/event.acl'
import { hostAcl } from '../../../modules/host/host.acl'
import { integrationAcl } from '../../../modules/integration/integration.acl'
import { journeyAcl } from '../../../modules/journey/journey.acl'
import { JourneyCollectionAcl } from '../../../modules/journeyCollection/journeyCollection.acl'
import { journeyNotificationAcl } from '../../../modules/journeyNotification/journeyNotification.acl'
import { JourneyThemeAcl } from '../../../modules/journeyTheme/journeyTheme.acl'
import { journeyVisitorAcl } from '../../../modules/journeyVisitor/journeyVisitor.acl'
import { qrCodeAcl } from '../../../modules/qrCode/qrCode.acl'
import { teamAcl } from '../../../modules/team/team.acl'
import { userInviteAcl } from '../../../modules/userInvite/userInvite.acl'
import { userJourneyAcl } from '../../../modules/userJourney/userJourney.acl'
import { userTeamAcl } from '../../../modules/userTeam/userTeam.acl'
import { userTeamInviteAcl } from '../../../modules/userTeamInvite/userTeamInvite.acl'
import { visitorAcl } from '../../../modules/visitor/visitor.acl'
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
    const acls = [
      blockAcl,
      customDomainAcl,
      eventAcl,
      hostAcl,
      integrationAcl,
      qrCodeAcl,
      journeyAcl,
      JourneyCollectionAcl,
      journeyNotificationAcl,
      JourneyThemeAcl,
      journeyVisitorAcl,
      teamAcl,
      userInviteAcl,
      userJourneyAcl,
      userTeamAcl,
      userTeamInviteAcl,
      visitorAcl
    ]
    acls.forEach((acl) => acl({ can, cannot, user }))

    return build()
  }
}
