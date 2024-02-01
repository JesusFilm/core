import { getQueueToken } from '@nestjs/bullmq'
import { Test, TestingModule } from '@nestjs/testing'

import { Journey } from '.prisma/api-journeys-client'

import { UserInviteModule } from '../userInvite/userInvite.module'

import { UserInviteService } from './userInvite.service'

describe('UserTeamService', () => {
  let service: UserInviteService

  let emailQueue

  beforeEach(async () => {
    emailQueue = {
      add: jest.fn()
    }
    const module: TestingModule = await Test.createTestingModule({
      imports: [UserInviteModule]
    })
      .overrideProvider(getQueueToken('api-journeys-email'))
      .useValue(emailQueue)
      .compile()

    service = module.get<UserInviteService>(UserInviteService)
  })

  describe('sendEmail', () => {
    it('should send an email with the correct subject and body', async () => {
      const journey = {
        id: 'journeyId',
        title: 'Journey Title'
      } as unknown as Journey
      const url = `${process.env.JOURNEYS_ADMIN_URL ?? ''}/journeys/${
        journey.id
      }`
      const email = 'tav@example.com'

      await service.sendEmail(journey, email)

      expect(emailQueue.add).toHaveBeenCalledWith(
        'journey-edit-invite',
        {
          email,
          url,
          journeyTitle: 'Journey Title'
        },
        {
          removeOnComplete: true,
          removeOnFail: {
            age: 24 * 3600
          }
        }
      )
    })
  })
})
