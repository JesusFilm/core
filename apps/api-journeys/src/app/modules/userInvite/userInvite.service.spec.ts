import { getQueueToken } from '@nestjs/bullmq'
import { Test, TestingModule } from '@nestjs/testing'
import { render } from '@react-email/render'

import { Journey } from '.prisma/api-journeys-client'

import JourneyInviteEmail from '../../emails/JourneyInvite/JourneyInvite'
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
      const expectedBody = render(
        JourneyInviteEmail({
          email,
          journeyTitle: journey.title,
          inviteLink: url
        }),
        {
          pretty: true
        }
      )
      const expectedText = render(
        JourneyInviteEmail({
          email,
          journeyTitle: journey.title,
          inviteLink: url
        }),
        {
          plainText: true
        }
      )

      await service.sendEmail(journey, email)

      expect(emailQueue.add).toHaveBeenCalledWith(
        'email',
        {
          email,
          subject: expectedSubject,
          body: expectedBody,
          text: expectedText
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
