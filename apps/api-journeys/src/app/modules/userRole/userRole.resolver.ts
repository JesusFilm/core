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
import { UserRoleService } from './userRole.service'

@Resolver('UserRole')
export class UserRoleResolver {
  constructor(
    private readonly userRoleService: UserRoleService,
    private readonly journeyService: JourneyService
  ) {}
}
