import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'

import { VerifyUserJob } from '../email/email.consumer'

@Injectable()
export class UserService {
  constructor(
    @InjectQueue('api-users-email')
    private readonly emailQueue: Queue<VerifyUserJob>
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
