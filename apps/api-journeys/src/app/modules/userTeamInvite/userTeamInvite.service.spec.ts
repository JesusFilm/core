import { getQueueToken } from '@nestjs/bullmq'
import { Test, TestingModule } from '@nestjs/testing'
import { render } from '@react-email/render'

import { Team } from '.prisma/api-journeys-client'

import TeamInviteEmail from '../../emails/TeamInvite'
import { UserTeamInviteModule } from '../userTeamInvite/userTeamInvite.module'

import { UserTeamInviteService } from './userTeamInvite.service'

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

      const expectedBody = render(
        TeamInviteEmail({
          teamName: team.title,
          email,
          inviteLink: `${process.env.JOURNEYS_ADMIN_URL ?? ''}/`
        }),
        {
          pretty: true
        }
      )

      const expectedText = render(
        TeamInviteEmail({
          teamName: team.title,
          email,
          inviteLink: `${process.env.JOURNEYS_ADMIN_URL ?? ''}/`
        }),
        {
          plainText: true
        }
      )

      await service.sendEmail(team, email)

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
