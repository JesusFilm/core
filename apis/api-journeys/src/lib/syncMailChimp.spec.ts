import mailchimp from '@mailchimp/mailchimp_marketing'

import { syncMailChimp } from './syncMailChimp'

describe('syncMailChimp', () => {
  const user = {
    email: 'profile@synthetic.example',
    firstName: 'Profile',
    lastName: 'User'
  }

  beforeEach(() => {
    vi.stubEnv('MAILCHIMP_AUDIENCE_ID', 'controlled-profile-audience')
    vi.stubEnv('GIT_BRANCH', 'feature')
    vi.spyOn(mailchimp, 'setConfig').mockReturnValue()
    vi.spyOn(mailchimp.lists, 'setListMember').mockResolvedValue(
      {} as Awaited<ReturnType<typeof mailchimp.lists.setListMember>>
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  it('replays the same member upsert without changing an existing subscription status', async () => {
    await syncMailChimp(user)
    await syncMailChimp(user)
    expect(mailchimp.lists.setListMember).toHaveBeenCalledTimes(2)
    for (const call of vi.mocked(mailchimp.lists.setListMember).mock.calls)
      expect(call).toEqual([
        'controlled-profile-audience',
        user.email,
        {
          email_address: user.email,
          status_if_new: 'subscribed',
          merge_fields: { FNAME: user.firstName, LNAME: user.lastName }
        }
      ])
  })

  it('keeps missing audience configuration retryable without sending', async () => {
    vi.stubEnv('MAILCHIMP_AUDIENCE_ID', undefined)
    await expect(syncMailChimp(user)).rejects.toThrow(
      'Mailchimp Audience ID is undefined'
    )
    expect(mailchimp.lists.setListMember).not.toHaveBeenCalled()
  })

  it('rejects a missing email without sending', async () => {
    await expect(syncMailChimp({ ...user, email: null })).rejects.toThrow(
      'User must have an email'
    )
    expect(mailchimp.lists.setListMember).not.toHaveBeenCalled()
  })

  it.each(['feature', 'main'])(
    'preserves the invalid development-email exception on %s',
    async (branch) => {
      vi.stubEnv('GIT_BRANCH', branch)
      const error = Object.assign(new Error('Mailchimp validation failed'), {
        response: {
          body: {
            detail: `${user.email} looks fake or invalid, please enter a real email address.`
          }
        }
      })
      vi.mocked(mailchimp.lists.setListMember).mockRejectedValue(error)
      if (branch === 'main')
        await expect(syncMailChimp(user)).rejects.toBe(error)
      else await expect(syncMailChimp(user)).resolves.toBeUndefined()
    }
  )

  it('propagates provider failures so the receipt remains retryable', async () => {
    const error = new Error('Mailchimp unavailable')
    vi.mocked(mailchimp.lists.setListMember).mockRejectedValue(error)
    await expect(syncMailChimp(user)).rejects.toBe(error)
  })
})
