import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'
import { graphql } from '../../../lib/graphql/subgraphGraphql'

describe('blockUpdateLinkAction mutation', () => {
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: { id: 'testUserId' } }
  })

  const MUTATION = graphql(`
    mutation BlockUpdateLinkAction($id: ID!, $input: LinkActionInput!) {
      blockUpdateLinkAction(id: $id, input: $input) {
        __typename
        url
        target
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
    it('creates or updates link action', async () => {
      prismaMock.block.findUnique.mockResolvedValueOnce(actionableBlock)

      prismaMock.action.upsert.mockResolvedValueOnce({
        parentBlockId: '1',
        gtmEventName: null,
        url: 'https://example.com',
        target: null
      } as any)

      const result = await authClient({
        document: MUTATION,
        variables: {
          id: actionableBlock.id,
          input: {
            gtmEventName: null,
            url: 'https://example.com',
            target: null
          }
        }
      })

      expect(prismaMock.action.upsert).toHaveBeenCalledWith({
        where: { parentBlockId: '1' },
        create: {
          parentBlockId: '1',
          gtmEventName: null,
          url: 'https://example.com',
          target: null,
          blockId: null,
          journeyId: null,
          email: null
        },
        update: {
          gtmEventName: null,
          url: 'https://example.com',
          target: null,
          blockId: null,
          journeyId: null,
          email: null
        }
      })

      expect(result).toEqual({
        data: {
          blockUpdateLinkAction: {
            __typename: 'LinkAction',
            url: 'https://example.com',
            target: null,
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
            url: 'https://example.com',
            target: null
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
            url: 'https://example.com',
            target: null
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

    it('returns error if block does not support link actions', async () => {
      const wrongBlock = { ...actionableBlock, typename: 'ImageBlock' }
      prismaMock.block.findUnique.mockResolvedValueOnce(wrongBlock)

      const result = await authClient({
        document: MUTATION,
        variables: {
          id: wrongBlock.id,
          input: {
            gtmEventName: null,
            url: 'https://example.com',
            target: null
          }
        }
      })

      expect(result).toEqual({
        data: null,
        errors: [
          expect.objectContaining({
            message: 'This block does not support link actions'
          })
        ]
      })
    })
  })
})
