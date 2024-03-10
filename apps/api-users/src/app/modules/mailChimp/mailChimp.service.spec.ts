import mailchimp from '@mailchimp/mailchimp_marketing'
import { Test, TestingModule } from '@nestjs/testing'

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

  describe('upsertContactToAudience', () => {
    it('should add user to mailchimp', async () => {
      process.env.MAILCHIMP_AUDIENCE_ID = '1234'
      await mailChimpService.upsertContactToAudience({
        email: 'someemail@example.com',
        firstName: 'MyNama',
        lastName: 'Jeff'
      })

      expect(mailchimp.lists.setListMember).toHaveBeenCalledWith(
        '1234',
        'someemail@example.com',
        {
          email_address: 'someemail@example.com',
          merge_fields: { FNAME: 'MyNama', LNAME: 'Jeff' },
          status_if_new: 'subscribed'
        }
      )
    })

    it('should throw error if the audience id is undefined', async () => {
      await expect(
        mailChimpService.upsertContactToAudience({
          email: 'someemail@example.com',
          firstName: 'MyNama',
          lastName: 'Jeff'
        })
      ).rejects.toThrow('Mailchimp Audience ID is undefined')
    })
  })
})
