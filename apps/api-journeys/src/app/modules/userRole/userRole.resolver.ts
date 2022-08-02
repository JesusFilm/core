import { Resolver, Query } from '@nestjs/graphql'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import { UseGuards } from '@nestjs/common'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'
import { UserRole } from '../../__generated__/graphql'
import { UserRoleService } from './userRole.service'

@Resolver('UserRole')
export class UserRoleResolver {
  constructor(private readonly userRoleService: UserRoleService) {}

  @Query()
  @UseGuards(GqlAuthGuard)
  async getUserRole(@CurrentUserId() userId: string): Promise<UserRole> {
    const user: UserRole = await this.userRoleService.getUserRoleById(userId)

    if (user != null) {
      return user
    } else {
      return await this.userRoleService.save({
        userId
      })
    }
  }
}
