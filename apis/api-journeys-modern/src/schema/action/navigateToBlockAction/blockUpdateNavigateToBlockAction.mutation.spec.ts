import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'
import { graphql } from '../../../lib/graphql/subgraphGraphql'

describe('blockUpdateNavigateToBlockAction mutation', () => {
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: { id: 'testUserId' } }
  })

  const MUTATION = graphql(`
    mutation BlockUpdateNavigateToBlockAction(
      $id: ID!
      $input: NavigateToBlockActionInput!
    ) {
      blockUpdateNavigateToBlockAction(id: $id, input: $input) {
        __typename
        blockId
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
    journeyId: 'journeyId',
    journey: journeyWithAccess,
    action: null
  } as any

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('success', () => {
    it('creates or updates navigateToBlock action', async () => {
      prismaMock.block.findUnique.mockResolvedValueOnce(actionableBlock)

      prismaMock.action.upsert.mockResolvedValueOnce({
        parentBlockId: '1',
        gtmEventName: null,
        blockId: 'child-block',
        journeyId: 'journeyId'
      } as any)

      const result = await authClient({
        document: MUTATION,
        variables: {
          id: actionableBlock.id,
          input: { gtmEventName: null, blockId: 'child-block' }
        }
      })

      expect(prismaMock.action.upsert).toHaveBeenCalledWith({
        where: { parentBlockId: '1' },
        create: {
          parentBlockId: '1',
          gtmEventName: null,
          blockId: 'child-block'
        },
        update: {
          gtmEventName: null,
          blockId: 'child-block'
        },
        include: { parentBlock: true }
      })

      expect(result).toEqual({
        data: {
          blockUpdateNavigateToBlockAction: {
            __typename: 'NavigateToBlockAction',
            blockId: 'child-block',
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
          input: { gtmEventName: null, blockId: 'child-block' }
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
          input: { gtmEventName: null, blockId: 'child-block' }
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

    it('returns error if block does not support navigate action', async () => {
      const wrongBlock = { ...actionableBlock, typename: 'ImageBlock' }
      prismaMock.block.findUnique.mockResolvedValueOnce(wrongBlock)

      const result = await authClient({
        document: MUTATION,
        variables: {
          id: wrongBlock.id,
          input: { gtmEventName: null, blockId: 'child-block' }
        }
      })

      expect(result).toEqual({
        data: null,
        errors: [
          expect.objectContaining({
            message: 'This block does not support navigate to block actions'
          })
        ]
      })
    })
  })
})
