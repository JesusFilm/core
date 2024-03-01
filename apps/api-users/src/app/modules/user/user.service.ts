import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'
import { getAuth } from 'firebase-admin/auth'

import { firebaseClient } from '@core/nest/common/firebaseClient'

import { PrismaService } from '../../lib/prisma.service'
import { VerifyUserJob } from '../email/email.consumer'

@Injectable()
export class UserService {
  constructor(
    @InjectQueue('api-users-email')
    private readonly emailQueue: Queue<VerifyUserJob>,
    private readonly prismaService: PrismaService
  ) {}

  async verifyUser(
    userId: string,
    email: string,
    redirectLink: string | undefined = undefined
  ): Promise<void> {
    const token = Math.floor(100000 + Math.random() * 900000).toString() // six digit, first is not 0
    const job = await this.emailQueue.getJob(userId)
    if (job != null) {
      await job.remove()
      await this.emailQueue.add(
        'verifyUser',
        {
          userId,
          email,
          token,
          redirectLink
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
          redirectLink
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
