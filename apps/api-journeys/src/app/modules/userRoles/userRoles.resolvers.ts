import {
  Args,
  Resolver,
  Mutation,
  Parent,
  Query,
  ResolveField
} from '@nestjs/graphql'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import { UseGuards } from '@nestjs/common'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'
import { AuthenticationError } from 'apollo-server-errors'
import { JourneyService } from '../journey/journey.service'
import { UserRolesService } from './userRoles.service'

@Resolver('UserRoles')
export class UserRolesResolver {
  constructor(
    private readonly userRoleService: UserRolesService,
    private readonly journeyService: JourneyService
  ) {}
}
