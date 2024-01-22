import { Test, TestingModule } from '@nestjs/testing'

import { Team } from '.prisma/api-journeys-client'

import { UserTeamInviteService } from './userTeamInvite.service'
import { UserTeamInviteModule } from '../userTeamInvite/userTeamInvite.module'
import { getQueueToken } from '@nestjs/bullmq'

describe('UserTeamService', () => {
  let service: UserTeamInviteService

  let emailQueue

  beforeEach(async () => {
    emailQueue = {
      add: jest.fn()
    }
    const module: TestingModule = await Test.createTestingModule({
      imports: [UserTeamInviteModule]
    })
      .overrideProvider(getQueueToken('api-journeys-email'))
      .useValue(emailQueue)
      .compile()

    service = module.get<UserTeamInviteService>(UserTeamInviteService)
  })

  describe('sendEmail', () => {
    it('should send an email with the correct subject and body', async () => {
      const team = {
        id: 'teamId',
        title: 'Team Title'
      } as unknown as Team
      const email = 'tav@example.com'
      const expectedSubject = `Invitation to join team: ${team.title}`
      const expectedBody = `<html><body>You have been invited to join the team: ${
        team.title
      }. You can join your team at: <a href="${
        process.env.JOURNEYS_ADMIN_URL ?? ''
      }/">${process.env.JOURNEYS_ADMIN_URL ?? ''}/</a>.</body></html>`

      await service.sendEmail(team, email)

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
