import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'

import { User } from '.prisma/api-users-client'

import { PrismaService } from '../../lib/prisma.service'
import { VerifyUserJob } from '../email/email.consumer'

@Injectable()
export class UserService {
  constructor(
    @InjectQueue('api-users-email')
    private readonly emailQueue: Queue<VerifyUserJob>,
    private readonly prismaService: PrismaService
  ) {}

  async verifyUser(userId: string, email: string): Promise<void> {
    const token = Math.floor(100000 + Math.random() * 900000).toString() // six digit, first is not 0
    await this.emailQueue.add(
      'verifyUser',
      {
        userId,
        email,
        token
      },
      {
        jobId: `${userId}-${token}`,
        removeOnComplete: {
          age: 24 * 3600 // keep up to 24 hours
        },
        removeOnFail: {
          age: 24 * 3600 // keep up to 24 hours
        }
      }
    )
  }

  async validateEmail(user: User, token: string): Promise<boolean> {
    const job = await this.emailQueue.getJob(`${user.userId}-${token}`)
    if (job != null) {
      await this.prismaService.user.update({
        where: { userId: user.userId },
        data: { emailVerified: true }
      })
      return true
    }
    return false
  }
}
