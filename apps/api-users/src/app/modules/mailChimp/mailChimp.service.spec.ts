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
  let mailChimpService: MailChimpService
  ;(mailchimp.lists.setListMember as jest.Mock).mockResolvedValue({})

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MailChimpService]
    }).compile()

    mailChimpService = module.get<MailChimpService>(MailChimpService)
    process.env.MAILCHIMP_AUDIENCE_ID = '1234'
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('upsertContactToAudience', () => {
    it('should add user to mailchimp', async () => {
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
  })
})
