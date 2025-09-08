import mailchimp from '@mailchimp/mailchimp_marketing'

import { User } from '@core/nest/common/firebaseClient'

import { mailChimpSyncUser } from './mailChimpSyncUser'

jest.mock('@mailchimp/mailchimp_marketing', () => ({
  setConfig: jest.fn(),
  lists: {
    setListMember: jest.fn()
  }
}))

const mockSetConfig = mailchimp.setConfig as jest.MockedFunction<
  typeof mailchimp.setConfig
>
const mockSetListMember = mailchimp.lists.setListMember as jest.MockedFunction<
  typeof mailchimp.lists.setListMember
>

describe('mailChimpSyncUser', () => {
  const mockUser: User = {
    id: 'userId',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    emailVerified: true
  }

  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = {
      ...originalEnv,
      MAILCHIMP_MARKETING_API_KEY: 'test-api-key',
      MAILCHIMP_MARKETING_API_SERVER_PREFIX: 'us1',
      MAILCHIMP_AUDIENCE_ID: 'test-audience-id'
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should successfully sync user to MailChimp', async () => {
    mockSetListMember.mockResolvedValue({} as any)

    await mailChimpSyncUser(mockUser)

    expect(mockSetConfig).toHaveBeenCalledWith({
      apiKey: 'test-api-key',
      server: 'us1'
    })

    expect(mockSetListMember).toHaveBeenCalledWith(
      'test-audience-id',
      'test@example.com',
      {
        email_address: 'test@example.com',
        status_if_new: 'subscribed',
        merge_fields: {
          FNAME: 'John',
          LNAME: 'Doe'
        }
      }
    )
  })

  it('should throw error when MAILCHIMP_AUDIENCE_ID is undefined', async () => {
    process.env.MAILCHIMP_AUDIENCE_ID = undefined

    await expect(mailChimpSyncUser(mockUser)).rejects.toThrow(
      'Mailchimp Audience ID is undefined'
    )

    expect(mockSetConfig).toHaveBeenCalled()
    expect(mockSetListMember).not.toHaveBeenCalled()
  })

  it('should throw error when user email is null', async () => {
    const userWithoutEmail = {
      ...mockUser,
      email: null
    }

    await expect(mailChimpSyncUser(userWithoutEmail)).rejects.toThrow(
      'User must have an email to receive marketing emails'
    )

    expect(mockSetConfig).toHaveBeenCalled()
    expect(mockSetListMember).not.toHaveBeenCalled()
  })

  it('should throw error when user email is undefined', async () => {
    const userWithoutEmail = {
      ...mockUser,
      email: undefined
    }

    await expect(mailChimpSyncUser(userWithoutEmail)).rejects.toThrow(
      'User must have an email to receive marketing emails'
    )

    expect(mockSetConfig).toHaveBeenCalled()
    expect(mockSetListMember).not.toHaveBeenCalled()
  })

  it('should handle MailChimp API errors and rethrow them', async () => {
    const apiError = new Error('MailChimp API error')
    mockSetListMember.mockRejectedValue(apiError)

    await expect(mailChimpSyncUser(mockUser)).rejects.toThrow(
      'MailChimp API error'
    )

    expect(mockSetConfig).toHaveBeenCalled()
    expect(mockSetListMember).toHaveBeenCalled()
  })

  it('should handle fake email error in non-main branch and return without error', async () => {
    process.env.GIT_BRANCH = 'feature-branch'

    const fakeEmailError = {
      response: {
        body: {
          detail:
            'test@example.com looks fake or invalid, please enter a real email address.'
        }
      }
    }

    mockSetListMember.mockRejectedValue(fakeEmailError)

    await expect(mailChimpSyncUser(mockUser)).resolves.toBeUndefined()

    expect(mockSetConfig).toHaveBeenCalled()
    expect(mockSetListMember).toHaveBeenCalled()
  })

  it('should throw fake email error in main branch', async () => {
    process.env.GIT_BRANCH = 'main'

    const fakeEmailError = {
      response: {
        body: {
          detail:
            'test@example.com looks fake or invalid, please enter a real email address.'
        }
      }
    }

    mockSetListMember.mockRejectedValue(fakeEmailError)

    await expect(mailChimpSyncUser(mockUser)).rejects.toEqual(fakeEmailError)

    expect(mockSetConfig).toHaveBeenCalled()
    expect(mockSetListMember).toHaveBeenCalled()
  })

  it('should handle user with null firstName and lastName', async () => {
    const userWithNullNames = {
      ...mockUser,
      firstName: null,
      lastName: null
    }

    mockSetListMember.mockResolvedValue({} as any)

    await mailChimpSyncUser(userWithNullNames as unknown as User)

    expect(mockSetListMember).toHaveBeenCalledWith(
      'test-audience-id',
      'test@example.com',
      {
        email_address: 'test@example.com',
        status_if_new: 'subscribed',
        merge_fields: {
          FNAME: null,
          LNAME: null
        }
      }
    )
  })

  it('should handle user with undefined firstName and lastName', async () => {
    const userWithUndefinedNames = {
      ...mockUser,
      firstName: undefined,
      lastName: undefined
    }

    mockSetListMember.mockResolvedValue({} as any)

    await mailChimpSyncUser(userWithUndefinedNames as unknown as User)

    expect(mockSetListMember).toHaveBeenCalledWith(
      'test-audience-id',
      'test@example.com',
      {
        email_address: 'test@example.com',
        status_if_new: 'subscribed',
        merge_fields: {
          FNAME: undefined,
          LNAME: undefined
        }
      }
    )
  })
})
