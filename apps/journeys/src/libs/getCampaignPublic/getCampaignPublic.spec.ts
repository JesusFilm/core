import { ApolloClient, CombinedGraphQLErrors } from '@apollo/client'

import { campaignPublic } from '@core/journeys/ui/Campaign/testData'

import { GET_CAMPAIGN_PUBLIC, apolloCampaignReader } from './getCampaignPublic'

function client(): { query: ReturnType<typeof vi.fn> } & ApolloClient {
  const query = vi.fn(() => Promise.resolve({ data: { campaignPublic } }))
  return { query } as unknown as {
    query: ReturnType<typeof vi.fn>
  } & ApolloClient
}

function notFoundError(): CombinedGraphQLErrors {
  return new CombinedGraphQLErrors({
    errors: [{ message: 'not found', extensions: { code: 'NOT_FOUND' } }]
  } as ConstructorParameters<typeof CombinedGraphQLErrors>[0])
}

describe('apolloCampaignReader', () => {
  it('reads a campaign by slug in the language it is given', async () => {
    const apollo = client()

    const campaign = await apolloCampaignReader(apollo)(
      { slug: 'outreach-2026' },
      '496'
    )

    expect(campaign).toBe(campaignPublic)
    expect(apollo.query).toHaveBeenCalledWith(
      expect.objectContaining({
        query: GET_CAMPAIGN_PUBLIC,
        variables: { slug: 'outreach-2026', languageId: '496' }
      })
    )
  })

  it('reads the campaign of a hostname in the campaign default', async () => {
    const apollo = client()

    await apolloCampaignReader(apollo)({ hostname: 'outreach.example.org' })

    expect(apollo.query.mock.calls[0][0].variables).toEqual({
      hostname: 'outreach.example.org',
      languageId: null
    })
  })

  it('aborts a read after five seconds through the fetch signal', async () => {
    const timeout = vi.spyOn(AbortSignal, 'timeout')
    const apollo = client()

    await apolloCampaignReader(apollo)({ slug: 'outreach-2026' })

    expect(timeout).toHaveBeenCalledWith(5_000)
    expect(apollo.query.mock.calls[0][0].context.fetchOptions.signal).toBe(
      timeout.mock.results[0].value
    )
    timeout.mockRestore()
  })

  it('is null without a query for a malformed slug or an empty hostname', async () => {
    const apollo = client()
    const read = apolloCampaignReader(apollo)

    expect(await read({ slug: 'Not A Slug' })).toBeNull()
    expect(await read({ hostname: '' })).toBeNull()
    expect(apollo.query).not.toHaveBeenCalled()
  })

  it('is null for a draft or unknown campaign', async () => {
    const apollo = client()
    apollo.query.mockRejectedValueOnce(notFoundError())

    expect(
      await apolloCampaignReader(apollo)({ slug: 'draft-2026' })
    ).toBeNull()
  })

  it('throws any other failure, a timeout included', async () => {
    const apollo = client()
    apollo.query
      .mockRejectedValueOnce(new Error('socket hang up'))
      .mockRejectedValueOnce(
        new DOMException('The operation was aborted.', 'AbortError')
      )
    const read = apolloCampaignReader(apollo)

    await expect(read({ slug: 'christmas-2026' })).rejects.toThrow(
      'socket hang up'
    )
    await expect(read({ hostname: 'christmas.example.org' })).rejects.toThrow(
      'The operation was aborted.'
    )
  })
})
