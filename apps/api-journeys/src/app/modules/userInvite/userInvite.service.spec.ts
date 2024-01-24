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
      const expectedSubject = `Invitation to edit journey: ${journey.title}`
      const expectedBody = `<html><body>You have been invited to edit the journey: ${journey.title}. You can find the journey at: <a href="${url}">${url}</a>.</body></html>`

      await service.sendEmail(journey, email)

      expect(emailQueue.add).toHaveBeenCalledWith(
        'email',
        {
          email,
          subject: expectedSubject,
          body: expectedBody
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
