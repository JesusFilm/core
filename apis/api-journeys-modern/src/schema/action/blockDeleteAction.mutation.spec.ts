import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

describe('blockDeleteAction mutation', () => {
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: { id: 'testUserId' } }
  })

  const MUTATION = graphql(`
    mutation BlockDeleteAction($id: ID!) {
      blockDeleteAction(id: $id) {
        id
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
    action: { parentBlockId: '1' }
  } as any

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('success', () => {
    it('deletes the block action and returns block', async () => {
      prismaMock.block.findUnique.mockResolvedValueOnce(actionableBlock)

      const result = await authClient({
        document: MUTATION,
        variables: { id: actionableBlock.id }
      })

      expect(prismaMock.action.delete).toHaveBeenCalledWith({
        where: { parentBlockId: actionableBlock.id }
      })
      expect(result).toEqual({
        data: { blockDeleteAction: { id: actionableBlock.id } }
      })
    })

    it('does nothing if there is no action and returns block', async () => {
      const noActionBlock = { ...actionableBlock, action: null }
      prismaMock.block.findUnique.mockResolvedValueOnce(noActionBlock)

      const result = await authClient({
        document: MUTATION,
        variables: { id: noActionBlock.id }
      })

      expect(prismaMock.action.delete).not.toHaveBeenCalled()
      expect(result).toEqual({
        data: { blockDeleteAction: { id: noActionBlock.id } }
      })
    })
  })

  describe('errors', () => {
    it('returns error if block not found', async () => {
      prismaMock.block.findUnique.mockResolvedValueOnce(null as any)

      const result = await authClient({
        document: MUTATION,
        variables: { id: 'missing' }
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
        variables: { id: noAccessBlock.id }
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

    it('returns error if block does not support actions', async () => {
      const wrongBlock = { ...actionableBlock, typename: 'ImageBlock' }
      prismaMock.block.findUnique.mockResolvedValueOnce(wrongBlock)

      const result = await authClient({
        document: MUTATION,
        variables: { id: wrongBlock.id }
      })

      expect(result).toEqual({
        data: null,
        errors: [
          expect.objectContaining({
            message: 'This block does not support actions'
          })
        ]
      })
    })
  })
})
