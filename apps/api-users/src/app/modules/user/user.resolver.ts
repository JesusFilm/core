import { UseGuards } from '@nestjs/common'
import {
  Args,
  Context,
  Mutation,
  Query,
  ResolveReference,
  Resolver
} from '@nestjs/graphql'
import { GraphQLError } from 'graphql'

import { User } from '.prisma/api-users-client'
import { auth, impersonateUser } from '@core/nest/common/firebaseClient'
import { CurrentIPAddress } from '@core/nest/decorators/CurrentIPAddress'
import { CurrentUser } from '@core/nest/decorators/CurrentUser'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'

import { CreateVerificationRequestInput } from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'

import { UserService } from './user.service'

export function validateIpV4(s: string | null): boolean {
  if (s == null) return true // localhost

  const match = s.match(/([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/g)
  const ip = match?.[0] ?? ''
  return (
    ip === '3.13.104.200' || // prod aws nat
    ip === '18.225.26.131' || // stage aws nat
    ip === '127.0.0.1' // localhsot
  )
}

export function isValidInterOp(token: string, address: string): boolean {
  const validIp = validateIpV4(address)
  return token === process.env.INTEROP_TOKEN && validIp
}

@Resolver('User')
export class UserResolver {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService
  ) {}

  @Query()
  @UseGuards(GqlAuthGuard)
  async me(@CurrentUserId() userId: string): Promise<User> {
    return await this.findOrFetchUser(userId)
  }

  @Query()
  async user(
    @Args('id') id: string,
    @CurrentIPAddress() ipAddress: string,
    @Context()
    context: { headers: Record<string, string> }
  ): Promise<User | null> {
    if (!isValidInterOp(context.headers['interop-token'], ipAddress)) {
      throw new GraphQLError('Invalid Interop Token')
    }
    return await this.prismaService.user.findUnique({ where: { userId: id } })
  }

  @Query()
  async userByEmail(
    @Args('email') email: string,
    @CurrentIPAddress() ipAddress: string,
    @Context()
    context: { headers: Record<string, string> }
  ): Promise<User | null> {
    if (!isValidInterOp(context.headers['interop-token'], ipAddress)) {
      throw new GraphQLError('Invalid Interop Token')
    }
    return await this.prismaService.user.findUnique({ where: { email } })
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
    __typename: 'User'
    id: string
  }): Promise<User> {
    return await this.findOrFetchUser(reference.id, undefined)
  }

  private async findOrFetchUser(
    userId: string,
    redirect: string | undefined = undefined
  ): Promise<User> {
    const existingUser = await this.prismaService.user.findUnique({
      where: {
        userId
      }
    })
    if (existingUser != null && existingUser.emailVerified == null) {
      const user = await this.prismaService.user.update({
        where: {
          id: userId
        },
        data: {
          emailVerified: false
        }
      })
      return user
    }

    if (existingUser != null && existingUser.emailVerified != null)
      return existingUser

    const {
      displayName,
      email,
      emailVerified,
      photoURL: imageUrl
    } = await auth.getUser(userId)

    const firstName = displayName?.split(' ')?.slice(0, -1)?.join(' ') ?? ''
    const lastName = displayName?.split(' ')?.slice(-1)?.join(' ') ?? ''

    const data = {
      userId,
      firstName,
      lastName,
      email: email ?? '',
      imageUrl,
      emailVerified
    }

    let user: User | null = null
    let retry = 0

    // this function can run in parallel as such it is possible for multiple
    // calls to reach this point and try to create the same user
    // due to the earlier firebase async call.
    try {
      user = await this.prismaService.user.create({
        data
      })
      // after user create so it is ony sent once
      if (!emailVerified && email != null) {
        await this.userService.verifyUser(userId, email, redirect)
      }
    } catch (e) {
      do {
        user = await this.prismaService.user.update({
          where: {
            id: userId
          },
          data
        })
        retry++
      } while (user == null && retry < 3)
    }
    return user
  }

  @Mutation()
  async validateEmail(
    @Args('token') token: string,
    @Args('email') email: string
  ): Promise<User> {
    const user = await this.prismaService.user.findUnique({
      where: {
        email
      }
    })
    if (user == null)
      throw new GraphQLError('User not found', { extensions: { code: '404' } })

    const validateEmail = await this.userService.validateEmail(
      user.userId,
      token
    )
    if (!validateEmail)
      throw new GraphQLError('Invalid token', { extensions: { code: '403' } })
    return { ...user, emailVerified: true }
  }

  @Mutation()
  async createVerificationRequest(
    @CurrentUser() user: User,
    @Args('input') input?: CreateVerificationRequestInput
  ): Promise<boolean> {
    console.log('input', input)
    if (user == null)
      throw new GraphQLError('User not found', { extensions: { code: '404' } })

    await this.userService.verifyUser(
      user.id,
      user.email,
      input?.redirect ?? undefined
    )
    return true
  }
}
