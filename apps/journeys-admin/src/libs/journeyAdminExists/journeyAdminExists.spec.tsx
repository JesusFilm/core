import { ApolloClient, NormalizedCacheObject } from '@apollo/client'

import { GET_ADMIN_JOURNEY } from './journeyAdminExists'

import { journeyAdminExists } from '.'

describe('journeyAdminExists', () => {
  it('calls apollo client', async () => {
    const client = {
      query: jest.fn().mockResolvedValue({ data: {} })
    } as unknown as ApolloClient<NormalizedCacheObject>

    await journeyAdminExists(client, '1')

    expect(client.query).toHaveBeenCalledWith({
      query: GET_ADMIN_JOURNEY,
      variables: { id: '1' }
    })
  })
})
