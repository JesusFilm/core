import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'
import { graphql } from '../../../lib/graphql/subgraphGraphql'

describe('blockUpdatePhoneAction mutation', () => {
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: { id: 'testUserId' } }
  })

  const MUTATION = graphql(`
    mutation BlockUpdatePhoneAction($id: ID!, $input: PhoneActionInput!) {
      blockUpdatePhoneAction(id: $id, input: $input) {
        __typename
        phone
        gtmEventName
      }
    }
  `)

  const journeyWithAccess = {
    id: 'journeyId',
    template: false,
    status: 'published',
    userJourneys: [],
    team: { userTeams: [{ userId: 'testUserId', role: 'manager' }] }
  } as any

  const actionableBlock = {
    id: '1',
    typename: 'RadioOptionBlock',
    parentBlockId: 'parent-step-id',
    journey: journeyWithAccess,
    action: null
  } as any

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('success', () => {
    it('creates or updates phone action', async () => {
      prismaMock.block.findUnique.mockResolvedValueOnce(actionableBlock)

      prismaMock.action.upsert.mockResolvedValueOnce({
        parentBlockId: '1',
        gtmEventName: null,
        phone: '+15551234567'
      } as any)

      const result = await authClient({
        document: MUTATION,
        variables: {
          id: actionableBlock.id,
          input: {
            gtmEventName: null,
            phone: '+15551234567',
            countryCode: 'US'
          }
        }
      })

      expect(prismaMock.action.upsert).toHaveBeenCalledWith({
        where: { parentBlockId: '1' },
        create: {
          gtmEventName: null,
          phone: '+15551234567',
          countryCode: 'US',
          parentBlock: { connect: { id: '1' } }
        },
        update: {
          url: null,
          target: null,
          email: null,
          phone: '+15551234567',
          countryCode: 'US',
          journey: { disconnect: true },
          block: { disconnect: true },
          gtmEventName: null
        }
      })

      expect(result).toEqual({
        data: {
          blockUpdatePhoneAction: {
            __typename: 'PhoneAction',
            phone: '+15551234567',
            gtmEventName: null
          }
        }
      })
    })
  })

  describe('errors', () => {
    it('returns error if block not found', async () => {
      prismaMock.block.findUnique.mockResolvedValueOnce(null as any)

      const result = await authClient({
        document: MUTATION,
        variables: {
          id: 'missing',
          input: {
            gtmEventName: null,
            phone: '+15551234567',
            countryCode: 'US'
          }
        }
      })

      expect(result).toEqual({
        data: null,
        errors: [expect.objectContaining({ message: 'block not found' })]
      })
    })

    it('returns error if not authorized', async () => {
      const noAccessBlock = {
        ...actionableBlock,
        journey: { ...journeyWithAccess, team: { userTeams: [] } }
      }
      prismaMock.block.findUnique.mockResolvedValueOnce(noAccessBlock)

      const result = await authClient({
        document: MUTATION,
        variables: {
          id: noAccessBlock.id,
          input: {
            gtmEventName: null,
            phone: '+15551234567',
            countryCode: 'US'
          }
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

    it('returns error if block does not support phone actions', async () => {
      const wrongBlock = { ...actionableBlock, typename: 'ImageBlock' }
      prismaMock.block.findUnique.mockResolvedValueOnce(wrongBlock)

      const result = await authClient({
        document: MUTATION,
        variables: {
          id: wrongBlock.id,
          input: {
            gtmEventName: null,
            phone: '+15551234567',
            countryCode: 'US'
          }
        }
      })

      expect(result).toEqual({
        data: null,
        errors: [
          expect.objectContaining({
            message: 'This block does not support phone actions'
          })
        ]
      })
    })

    it('returns error if phone number is invalid', async () => {
      prismaMock.block.findUnique.mockResolvedValueOnce(actionableBlock)

      const result = await authClient({
        document: MUTATION,
        variables: {
          id: actionableBlock.id,
          input: {
            gtmEventName: null,
            phone: 'not a phone number',
            countryCode: 'US'
          }
        }
      })

      expect(result).toEqual({
        data: null,
        errors: [
          expect.objectContaining({
            message: 'must be a valid phone number'
          })
        ]
      })
    })
  })
})
