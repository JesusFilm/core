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

describe('signUpBlockUpdate', () => {
  const mockUser = { id: 'userId' }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const SIGN_UP_BLOCK_UPDATE = graphql(`
    mutation SignUpBlockUpdate($id: ID!, $input: SignUpBlockUpdateInput!) {
      signUpBlockUpdate(id: $id, input: $input) {
        id
        journeyId
        parentBlockId
        parentOrder
        submitLabel
        submitIconId
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

  it('updates sign up block when authorized', async () => {
    fetchBlockWithJourneyAcl.mockResolvedValue({
      id,
      journeyId: 'journeyId',
      journey: { id: 'journeyId' }
    })
    mockAbility.mockReturnValue(true)

    const tx = {
      block: {
        update: jest.fn().mockResolvedValue({
          id,
          typename: 'SignUpBlock',
          journeyId: 'journeyId',
          parentBlockId: 'parentId',
          parentOrder: 0,
          submitLabel: 'Updated Label',
          submitIconId: null
        })
      },
      action: { upsert: jest.fn(), delete: jest.fn() },
      journey: { update: jest.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const result = await authClient({
      document: SIGN_UP_BLOCK_UPDATE,
      variables: {
        id,
        input: { submitLabel: 'Updated Label' }
      }
    })

    expect(fetchBlockWithJourneyAcl).toHaveBeenCalledWith(id)
    expect(tx.block.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id },
        data: expect.objectContaining({
          submitLabel: 'Updated Label'
        })
      })
    )
    expect(tx.journey.update).toHaveBeenCalled()

    expect(result).toEqual({
      data: {
        signUpBlockUpdate: expect.objectContaining({
          id,
          journeyId: 'journeyId',
          submitLabel: 'Updated Label'
        })
      }
    })
  })

  it('returns FORBIDDEN when unauthorized', async () => {
    fetchBlockWithJourneyAcl.mockResolvedValue({
      id,
      journeyId: 'journeyId',
      journey: { id: 'journeyId' }
    })
    mockAbility.mockReturnValue(false)

    const result = await authClient({
      document: SIGN_UP_BLOCK_UPDATE,
      variables: {
        id,
        input: { submitLabel: 'Updated Label' }
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

  it('updates with valid submitIconId', async () => {
    prismaMock.block.findUnique.mockResolvedValue({
      id: 'iconId',
      parentBlockId: id
    } as any)
    fetchBlockWithJourneyAcl.mockResolvedValue({
      id,
      journeyId: 'journeyId',
      journey: { id: 'journeyId' }
    })
    mockAbility.mockReturnValue(true)

    const tx = {
      block: {
        update: jest.fn().mockResolvedValue({
          id,
          typename: 'SignUpBlock',
          journeyId: 'journeyId',
          parentBlockId: 'parentId',
          parentOrder: 0,
          submitLabel: 'Sign Up',
          submitIconId: 'iconId'
        })
      },
      action: { upsert: jest.fn(), delete: jest.fn() },
      journey: { update: jest.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const result = await authClient({
      document: SIGN_UP_BLOCK_UPDATE,
      variables: {
        id,
        input: { submitIconId: 'iconId' }
      }
    })

    expect(prismaMock.block.findUnique).toHaveBeenCalledWith({
      where: { id: 'iconId', deletedAt: null }
    })
    expect(tx.block.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id },
        data: expect.objectContaining({
          submitIconId: 'iconId'
        })
      })
    )

    expect(result).toEqual({
      data: {
        signUpBlockUpdate: expect.objectContaining({
          id,
          submitIconId: 'iconId'
        })
      }
    })
  })

  it('returns NOT_FOUND for invalid submitIconId', async () => {
    prismaMock.block.findUnique.mockResolvedValue(null)

    const result = await authClient({
      document: SIGN_UP_BLOCK_UPDATE,
      variables: {
        id,
        input: { submitIconId: 'nonExistentId' }
      }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'Submit icon does not exist'
        })
      ]
    })
  })

  it('returns NOT_FOUND when submitIconId is not a child of the block', async () => {
    prismaMock.block.findUnique.mockResolvedValue({
      id: 'iconId',
      parentBlockId: 'otherBlockId'
    } as any)

    const result = await authClient({
      document: SIGN_UP_BLOCK_UPDATE,
      variables: {
        id,
        input: { submitIconId: 'iconId' }
      }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'Submit icon does not exist'
        })
      ]
    })
  })
})
