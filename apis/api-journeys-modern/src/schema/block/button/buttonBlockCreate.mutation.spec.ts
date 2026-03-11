import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'
import { ability } from '../../../lib/auth/ability'
import { graphql } from '../../../lib/graphql/subgraphGraphql'

jest.mock('../../../lib/auth/ability', () => ({
  Action: { Update: 'update' },
  ability: jest.fn(),
  subject: jest.fn((type, object) => ({ subject: type, object }))
}))

jest.mock('../../../lib/auth/fetchJourneyWithAclIncludes', () => ({
  fetchJourneyWithAclIncludes: jest.fn()
}))

describe('buttonBlockCreate', () => {
  const mockUser = { id: 'userId' }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const BUTTON_BLOCK_CREATE = graphql(`
    mutation ButtonBlockCreate($input: ButtonBlockCreateInput!) {
      buttonBlockCreate(input: $input) {
        id
        journeyId
        parentBlockId
        parentOrder
        label
      }
    }
  `)

  const {
    fetchJourneyWithAclIncludes
  } = require('../../../lib/auth/fetchJourneyWithAclIncludes')
  const mockAbility = ability as jest.MockedFunction<typeof ability>

  const input = {
    journeyId: 'journeyId',
    parentBlockId: 'parentId',
    label: 'Button Label'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    fetchJourneyWithAclIncludes.mockResolvedValue({ id: 'journeyId' })
    mockAbility.mockReturnValue(true)
    prismaMock.block.findMany.mockResolvedValue([] as any)
    prismaMock.block.findFirst.mockResolvedValue({
      id: 'parentId',
      journeyId: 'journeyId'
    } as any)
    prismaMock.block.findUnique.mockResolvedValue({
      id: 'blockId',
      typename: 'ButtonBlock',
      parentOrder: 0,
      journeyId: 'journeyId',
      parentBlockId: 'parentId',
      label: 'Button Label',
      settings: {}
    } as any)
  })

  it('creates button block when authorized', async () => {
    const tx = {
      block: {
        create: jest.fn().mockResolvedValue({
          id: 'blockId',
          typename: 'ButtonBlock',
          parentOrder: 0,
          journeyId: 'journeyId',
          parentBlockId: 'parentId',
          label: 'Button Label',
          settings: {},
          journey: { id: 'journeyId' }
        }),
        findMany: jest.fn().mockResolvedValue([])
      },
      journey: { update: jest.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const result = await authClient({
      document: BUTTON_BLOCK_CREATE,
      variables: { input }
    })

    expect(tx.block.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          typename: 'ButtonBlock',
          journey: { connect: { id: 'journeyId' } },
          parentBlock: { connect: { id: 'parentId' } },
          label: 'Button Label',
          settings: {}
        })
      })
    )
    expect(tx.journey.update).toHaveBeenCalled()

    expect(result).toEqual({
      data: {
        buttonBlockCreate: expect.objectContaining({
          id: 'blockId',
          journeyId: 'journeyId',
          parentBlockId: 'parentId',
          label: 'Button Label'
        })
      }
    })
  })

  it('creates button block with all optional fields', async () => {

    const tx = {
      block: {
        create: jest.fn().mockResolvedValue({
          id: 'customId',
          typename: 'ButtonBlock',
          parentOrder: 2,
          journeyId: 'journeyId',
          parentBlockId: 'parentId',
          label: 'Click Me',
          variant: 'contained',
          color: 'primary',
          size: 'large',
          submitEnabled: true,
          settings: { alignment: 'center', color: '#ff0000' },
          journey: { id: 'journeyId' }
        }),
        findMany: jest.fn().mockResolvedValue([{}, {}])
      },
      journey: { update: jest.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const fullInput = {
      id: 'customId',
      journeyId: 'journeyId',
      parentBlockId: 'parentId',
      label: 'Click Me',
      variant: 'contained' as const,
      color: 'primary' as const,
      size: 'large' as const,
      submitEnabled: true,
      settings: { alignment: 'center' as const, color: '#ff0000' }
    }

    const result = await authClient({
      document: BUTTON_BLOCK_CREATE,
      variables: { input: fullInput }
    })

    expect(tx.block.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id: 'customId',
          typename: 'ButtonBlock',
          label: 'Click Me',
          variant: 'contained',
          color: 'primary',
          size: 'large',
          submitEnabled: true,
          settings: { alignment: 'center', color: '#ff0000' },
          parentOrder: 2
        })
      })
    )

    expect(result).toEqual({
      data: {
        buttonBlockCreate: expect.objectContaining({
          id: 'customId',
          journeyId: 'journeyId',
          parentBlockId: 'parentId',
          label: 'Click Me'
        })
      }
    })
  })

  it('defaults settings to empty object when not provided', async () => {
    const tx = {
      block: {
        create: jest.fn().mockResolvedValue({
          id: 'blockId',
          typename: 'ButtonBlock',
          parentOrder: 0,
          journeyId: 'journeyId',
          parentBlockId: 'parentId',
          label: 'Button Label',
          settings: {},
          journey: { id: 'journeyId' }
        }),
        findMany: jest.fn().mockResolvedValue([])
      },
      journey: { update: jest.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    await authClient({
      document: BUTTON_BLOCK_CREATE,
      variables: { input }
    })

    expect(tx.block.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          settings: {}
        })
      })
    )
  })
})
