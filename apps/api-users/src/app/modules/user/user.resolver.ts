import { UseGuards } from '@nestjs/common'
import {
  Args,
  Mutation,
  Query,
  ResolveReference,
  Resolver
} from '@nestjs/graphql'
import { GraphQLError } from 'graphql'

import { User } from '.prisma/api-users-client'
import { auth, impersonateUser } from '@core/nest/common/firebaseClient'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'

import { PrismaService } from '../../lib/prisma.service'

@Resolver('User')
export class UserResolver {
  constructor(private readonly prismaService: PrismaService) {}

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
    } = await auth.getUser(userId)

    const firstName = displayName?.split(' ')?.slice(0, -1)?.join(' ') ?? ''
    const lastName = displayName?.split(' ')?.slice(-1)?.join(' ') ?? ''

    const data = {
      userId,
      firstName,
      lastName,
      email: email ?? '',
      imageUrl
    }

    // this function can run in parallel as such it is possible for multiple
    // calls to reach this point and try to create the same user
    // due to the earlier firebase async call.
    return await this.prismaService.user.upsert({
      where: {
        userId
      },
      create: data,
      update: data
    })
  }

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async userImpersonate(
    @CurrentUserId() userId: string,
    @Args('email') email: string
  ): Promise<string> {
    const currentUser = await this.prismaService.user.findUnique({
      where: {
        userId
      }
    })
    if (currentUser?.superAdmin !== true)
      throw new GraphQLError(
        'user is not allowed to impersonate another user',
        {
          extensions: { code: 'FORBIDDEN' }
        }
      )

    const userToImpersonate = await this.prismaService.user.findUnique({
      where: {
        email
      }
    })
    if (userToImpersonate?.userId == null)
      throw new GraphQLError('email does not match any user', {
        extensions: { code: 'NOT_FOUND' }
      })

    return await impersonateUser(userToImpersonate.userId)
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
