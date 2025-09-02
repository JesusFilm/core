import { UseGuards } from '@nestjs/common'
import { Query, Resolver } from '@nestjs/graphql'

import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'
import { UserRole } from '@core/prisma/journeys/client'

import { UserRoleService } from './userRole.service'

@Resolver('UserRole')
export class UserRoleResolver {
  constructor(private readonly userRoleService: UserRoleService) {}

  @Query()
  @UseGuards(GqlAuthGuard)
  async getUserRole(@CurrentUserId() userId: string): Promise<UserRole> {
    return await this.userRoleService.getUserRoleById(userId)
  }
}
