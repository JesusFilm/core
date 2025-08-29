import mailchimp from '@mailchimp/mailchimp_marketing'
import { Test, TestingModule } from '@nestjs/testing'

import { User } from '@core/nest/common/firebaseClient'

import { MailChimpService } from './mailChimp.service'

jest.mock('@mailchimp/mailchimp_marketing', () => {
  const originalModule = jest.requireActual('@mailchimp/mailchimp_marketing')
  return {
    ...originalModule,
    setConfig: jest.fn(),
    lists: {
      ...originalModule.lists,
      setListMember: jest.fn()
    }
  }
})

describe('MailChimpService', () => {
  const OLD_ENV = process.env
  let mailChimpService: MailChimpService
  const user: User = {
    id: 'newUserId',
    email: 'my-nama-yeff@example.com',
    firstName: 'My-Nama',
    lastName: 'Yeff',
    emailVerified: true
  }

  beforeEach(async () => {
    process.env = { ...OLD_ENV } // make a copy
    const module: TestingModule = await Test.createTestingModule({
      providers: [MailChimpService]
    }).compile()

    mailChimpService = module.get<MailChimpService>(MailChimpService)
  })

  afterEach(() => {
    process.env = OLD_ENV
    jest.clearAllMocks()
  })

  describe('syncUser', () => {
    it('should add user to mailchimp', async () => {
      process.env.MAILCHIMP_AUDIENCE_ID = '1234'
      await mailChimpService.syncUser(user)

      expect(mailchimp.lists.setListMember).toHaveBeenCalledWith(
        '1234',
        'my-nama-yeff@example.com',
        {
          email_address: 'my-nama-yeff@example.com',
          merge_fields: { FNAME: 'My-Nama', LNAME: 'Yeff' },
          status_if_new: 'subscribed'
        }
      )
    })

    it('should not throw error when looks fake or invalid', async () => {
      process.env.MAILCHIMP_AUDIENCE_ID = '1234'

      const setListMemberMock = mailchimp.lists
        .setListMember as unknown as jest.Mock

      setListMemberMock.mockRejectedValueOnce({
        response: {
          body: {
            detail:
              'my-nama-yeff@example.com looks fake or invalid, please enter a real email address.'
          }
        }
      })

      await expect(mailChimpService.syncUser(user)).resolves.toBeUndefined()

      expect(mailchimp.lists.setListMember).toHaveBeenCalledWith(
        '1234',
        'my-nama-yeff@example.com',
        {
          email_address: 'my-nama-yeff@example.com',
          merge_fields: { FNAME: 'My-Nama', LNAME: 'Yeff' },
          status_if_new: 'subscribed'
        }
      )
    })

    it('should throw error if the audience id is undefined', async () => {
      delete process.env.MAILCHIMP_AUDIENCE_ID
      await expect(mailChimpService.syncUser(user)).rejects.toThrow(
        'Mailchimp Audience ID is undefined'
      )
    })
  })
})
