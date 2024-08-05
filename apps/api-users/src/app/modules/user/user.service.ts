import crypto from 'crypto'

import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'
import { getAuth } from 'firebase-admin/auth'

import { User } from '.prisma/api-users-client'
import { auth, firebaseClient } from '@core/nest/common/firebaseClient'

import { PrismaService } from '../../lib/prisma.service'
import { VerifyUserJob } from '../email/email.consumer'

export function generateSixDigitNumber(): string {
  return crypto.randomInt(100000, 999999).toString()
}

@Injectable()
export class UserService {
  constructor(
    @InjectQueue('api-users-email')
    private readonly emailQueue: Queue<VerifyUserJob>,
    private readonly prismaService: PrismaService
  ) {}

  async findOrFetchUser(
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
    let userCreated = false
    // this function can run in parallel as such it is possible for multiple
    // calls to reach this point and try to create the same user
    // due to the earlier firebase async call.
    try {
      user = await this.prismaService.user.create({
        data
      })
      userCreated = true
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
    // after user create so it is only sent once
    if (email != null && userCreated && !emailVerified)
      await this.verifyUser(userId, email, redirect)
    return user
  }

  async verifyUser(
    userId: string,
    email: string,
    redirect?: string
  ): Promise<void> {
    const isExample = email.endsWith('@example.com')
    const token = isExample
      ? process.env.EXAMPLE_EMAIL_TOKEN ?? ''
      : generateSixDigitNumber()

    const job = await this.emailQueue.getJob(userId)
    if (job != null) {
      await job.remove()
      await this.emailQueue.add(
        'verifyUser',
        {
          userId,
          email,
          token,
          redirect
        },
        {
          jobId: userId,
          removeOnComplete: {
            age: 24 * 3600 // keep up to 24 hours
          },
          removeOnFail: {
            age: 24 * 3600 // keep up to 24 hours
          }
        }
      )
    } else {
      await this.emailQueue.add(
        'verifyUser',
        {
          userId,
          email,
          token,
          redirect
        },
        {
          jobId: userId,
          removeOnComplete: {
            age: 24 * 3600 // keep up to 24 hours
          },
          removeOnFail: {
            age: 24 * 3600 // keep up to 24 hours
          }
        }
      )
    }
  }

  async validateEmail(userId: string, token: string): Promise<boolean> {
    const job = await this.emailQueue.getJob(`${userId}`)
    if (job != null && job.data.token === token) {
      await this.prismaService.user.update({
        where: { userId },
        data: { emailVerified: true }
      })
      await getAuth(firebaseClient).updateUser(userId, {
        emailVerified: true
      })
      return true
    }
    return false
  }
}
