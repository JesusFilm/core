import { Resolver, Query, ResolveReference } from '@nestjs/graphql'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import { Inject, UseGuards } from '@nestjs/common'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'
import { firebaseClient } from '@core/nest/common/firebaseClient'
import { User } from '.prisma/api-users-client'
import { PrismaService } from '../../lib/prisma.service'

@Resolver('User')
export class UserResolver {
  constructor(
    @Inject(PrismaService) private readonly prismaService: PrismaService
  ) {}

  @Query()
  @UseGuards(GqlAuthGuard)
  async me(@CurrentUserId() userId: string): Promise<User> {
    const existingUser = await this.prismaService.user.findUnique({
      where: {
        userId
      }
    })

    if (existingUser != null) return existingUser

    const {
      displayName,
      email,
      photoURL: imageUrl
    } = await firebaseClient.auth().getUser(userId)

    const firstName = displayName?.split(' ')?.slice(0, -1)?.join(' ') ?? ''
    const lastName = displayName?.split(' ')?.slice(-1)?.join(' ') ?? ''

    const data = {
      userId,
      firstName,
      lastName,
      email: email ?? '',
      imageUrl
    }

    return await this.prismaService.user.create({
      data
    })
  }

  @ResolveReference()
  async resolveReference(reference: {
    __typename: string
    id: string
  }): Promise<User | null> {
    return await this.prismaService.user.findUnique({
      where: {
        userId: reference.id
      }
    })
  }
}
