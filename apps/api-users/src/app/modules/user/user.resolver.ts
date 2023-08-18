import { UseGuards } from '@nestjs/common'
import { Query, ResolveReference, Resolver } from '@nestjs/graphql'
import { auth } from 'firebase-admin'

import { User } from '.prisma/api-users-client'
import { firebaseClient } from '@core/nest/common/firebaseClient'
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
    } = await auth(firebaseClient).getUser(userId)

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
