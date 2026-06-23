import { type MockedFunction, vi } from 'vitest'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'
import { Action, ability } from '../../../lib/auth/ability'
import { fetchBlockWithJourneyAcl } from '../../../lib/auth/fetchBlockWithJourneyAcl'
import { graphql } from '../../../lib/graphql/subgraphGraphql'

vi.mock('../../../lib/auth/ability', () => ({
  Action: { Update: 'update' },
  ability: vi.fn(),
  subject: vi.fn((type, object) => ({ subject: type, object }))
}))

vi.mock('../../../lib/auth/fetchBlockWithJourneyAcl', () => ({
  fetchBlockWithJourneyAcl: vi.fn()
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
  const mockAbility = ability as MockedFunction<typeof ability>

  const id = 'blockId'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('updates sign up block when authorized', async () => {
    ;(fetchBlockWithJourneyAcl as any).mockResolvedValue({
      id,
      journeyId: 'journeyId',
      journey: { id: 'journeyId' }
    })
    mockAbility.mockReturnValue(true)

    const tx = {
      block: {
        update: vi.fn().mockResolvedValue({
          id,
          typename: 'SignUpBlock',
          journeyId: 'journeyId',
          parentBlockId: 'parentId',
          parentOrder: 0,
          submitLabel: 'Updated Label',
          submitIconId: null
        })
      },
      action: { upsert: vi.fn(), delete: vi.fn() },
      journey: { update: vi.fn().mockResolvedValue({ id: 'journeyId' }) }
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
    ;(fetchBlockWithJourneyAcl as any).mockResolvedValue({
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
    ;(fetchBlockWithJourneyAcl as any).mockResolvedValue({
      id,
      journeyId: 'journeyId',
      journey: { id: 'journeyId' }
    })
    mockAbility.mockReturnValue(true)
    prismaMock.block.findFirst.mockResolvedValue({
      id: 'iconId',
      parentBlockId: id,
      typename: 'IconBlock'
    } as any)

    const tx = {
      block: {
        update: vi.fn().mockResolvedValue({
          id,
          typename: 'SignUpBlock',
          journeyId: 'journeyId',
          parentBlockId: 'parentId',
          parentOrder: 0,
          submitLabel: 'Sign Up',
          submitIconId: 'iconId'
        })
      },
      action: { upsert: vi.fn(), delete: vi.fn() },
      journey: { update: vi.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const result = await authClient({
      document: SIGN_UP_BLOCK_UPDATE,
      variables: {
        id,
        input: { submitIconId: 'iconId' }
      }
    })

    expect(prismaMock.block.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'iconId',
        parentBlockId: id,
        typename: 'IconBlock',
        deletedAt: null
      }
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
    ;(fetchBlockWithJourneyAcl as any).mockResolvedValue({
      id,
      journeyId: 'journeyId',
      journey: { id: 'journeyId' }
    })
    mockAbility.mockReturnValue(true)
    prismaMock.block.findFirst.mockResolvedValue(null)

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
    ;(fetchBlockWithJourneyAcl as any).mockResolvedValue({
      id,
      journeyId: 'journeyId',
      journey: { id: 'journeyId' }
    })
    mockAbility.mockReturnValue(true)
    prismaMock.block.findFirst.mockResolvedValue(null)

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

  it('returns NOT_FOUND when submitIconId is not an IconBlock', async () => {
    ;(fetchBlockWithJourneyAcl as any).mockResolvedValue({
      id,
      journeyId: 'journeyId',
      journey: { id: 'journeyId' }
    })
    mockAbility.mockReturnValue(true)
    prismaMock.block.findFirst.mockResolvedValue(null)

    const result = await authClient({
      document: SIGN_UP_BLOCK_UPDATE,
      variables: {
        id,
        input: { submitIconId: 'notAnIconBlockId' }
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
