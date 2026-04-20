import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'
import { Action, ability } from '../../../lib/auth/ability'
import { graphql } from '../../../lib/graphql/subgraphGraphql'

jest.mock('../../../lib/auth/ability', () => ({
  Action: { Update: 'update' },
  ability: jest.fn(),
  subject: jest.fn((type, object) => ({ subject: type, object }))
}))

jest.mock('../../../lib/auth/fetchBlockWithJourneyAcl', () => ({
  fetchBlockWithJourneyAcl: jest.fn()
}))

describe('textResponseBlockUpdate', () => {
  const mockUser = { id: 'userId' }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const TEXT_RESPONSE_BLOCK_UPDATE = graphql(`
    mutation TextResponseBlockUpdate(
      $id: ID!
      $input: TextResponseBlockUpdateInput!
    ) {
      textResponseBlockUpdate(id: $id, input: $input) {
        id
        journeyId
        parentBlockId
        parentOrder
        ... on TextResponseBlock {
          label
          placeholder
          routeId
          integrationId
        }
      }
    }
  `)

  const {
    fetchBlockWithJourneyAcl
  } = require('../../../lib/auth/fetchBlockWithJourneyAcl')
  const mockAbility = ability as jest.MockedFunction<typeof ability>

  const id = 'blockId'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('updates text response block when authorized', async () => {
    fetchBlockWithJourneyAcl.mockResolvedValue({
      id,
      journeyId: 'journeyId',
      integrationId: null,
      journey: { id: 'journeyId' }
    })
    mockAbility.mockReturnValue(true)

    const tx = {
      block: {
        update: jest.fn().mockResolvedValue({
          id,
          typename: 'TextResponseBlock',
          journeyId: 'journeyId',
          parentBlockId: 'parentBlockId',
          parentOrder: 0,
          label: 'Updated label',
          placeholder: 'Type here',
          routeId: null,
          integrationId: null
        })
      },
      action: { upsert: jest.fn(), delete: jest.fn() },
      journey: { update: jest.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const result = await authClient({
      document: TEXT_RESPONSE_BLOCK_UPDATE,
      variables: {
        id,
        input: { label: 'Updated label', placeholder: 'Type here' }
      }
    })

    expect(fetchBlockWithJourneyAcl).toHaveBeenCalledWith(id)
    expect(tx.block.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id },
        data: expect.objectContaining({
          label: 'Updated label',
          placeholder: 'Type here'
        })
      })
    )

    expect(result).toEqual({
      data: {
        textResponseBlockUpdate: expect.objectContaining({
          id,
          label: 'Updated label',
          placeholder: 'Type here'
        })
      }
    })
  })

  it('returns FORBIDDEN when unauthorized', async () => {
    fetchBlockWithJourneyAcl.mockResolvedValue({
      id,
      journeyId: 'journeyId',
      integrationId: null,
      journey: { id: 'journeyId' }
    })
    mockAbility.mockReturnValue(false)

    const result = await authClient({
      document: TEXT_RESPONSE_BLOCK_UPDATE,
      variables: {
        id,
        input: { label: 'Updated' }
      }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'user is not allowed to update block'
        })
      ]
    })
  })

  it('allows routeId when block already has integrationId', async () => {
    fetchBlockWithJourneyAcl.mockResolvedValue({
      id,
      journeyId: 'journeyId',
      integrationId: 'existingIntegrationId',
      journey: { id: 'journeyId' }
    })
    mockAbility.mockReturnValue(true)

    const tx = {
      block: {
        update: jest.fn().mockResolvedValue({
          id,
          typename: 'TextResponseBlock',
          journeyId: 'journeyId',
          parentBlockId: 'parentBlockId',
          parentOrder: 0,
          label: 'Response',
          placeholder: null,
          routeId: 'routeId',
          integrationId: 'existingIntegrationId'
        })
      },
      action: { upsert: jest.fn(), delete: jest.fn() },
      journey: { update: jest.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const result = await authClient({
      document: TEXT_RESPONSE_BLOCK_UPDATE,
      variables: {
        id,
        input: { routeId: 'routeId' }
      }
    })

    expect(result).toEqual({
      data: {
        textResponseBlockUpdate: expect.objectContaining({
          id,
          routeId: 'routeId',
          integrationId: 'existingIntegrationId'
        })
      }
    })
  })

  it('allows routeId when integrationId is provided in input', async () => {
    fetchBlockWithJourneyAcl.mockResolvedValue({
      id,
      journeyId: 'journeyId',
      integrationId: null,
      journey: { id: 'journeyId' }
    })
    mockAbility.mockReturnValue(true)

    const tx = {
      block: {
        update: jest.fn().mockResolvedValue({
          id,
          typename: 'TextResponseBlock',
          journeyId: 'journeyId',
          parentBlockId: 'parentBlockId',
          parentOrder: 0,
          label: 'Response',
          placeholder: null,
          routeId: 'routeId',
          integrationId: 'newIntegrationId'
        })
      },
      action: { upsert: jest.fn(), delete: jest.fn() },
      journey: { update: jest.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const result = await authClient({
      document: TEXT_RESPONSE_BLOCK_UPDATE,
      variables: {
        id,
        input: { routeId: 'routeId', integrationId: 'newIntegrationId' }
      }
    })

    expect(result).toEqual({
      data: {
        textResponseBlockUpdate: expect.objectContaining({
          id,
          routeId: 'routeId',
          integrationId: 'newIntegrationId'
        })
      }
    })
  })

  it('returns BAD_USER_INPUT when routeId set without integration', async () => {
    fetchBlockWithJourneyAcl.mockResolvedValue({
      id,
      journeyId: 'journeyId',
      integrationId: null,
      journey: { id: 'journeyId' }
    })
    mockAbility.mockReturnValue(true)

    const result = await authClient({
      document: TEXT_RESPONSE_BLOCK_UPDATE,
      variables: {
        id,
        input: { routeId: 'routeId' }
      }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message:
            'route is being set but it is not associated to an integration'
        })
      ]
    })
  })
})
