import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'
import { Action, ability } from '../../../lib/auth/ability'
import { graphql } from '../../../lib/graphql/subgraphGraphql'

jest.mock('../../../lib/auth/ability', () => ({
  Action: { Update: 'update' },
  ability: jest.fn(),
  subject: jest.fn((type, object) => ({ subject: type, object }))
}))

jest.mock('../../../lib/auth/fetchJourneyWithAclIncludes', () => ({
  fetchJourneyWithAclIncludes: jest.fn()
}))

describe('multiselectBlockCreate', () => {
  const mockUser = { id: 'userId' }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const MULTISELECT_BLOCK_CREATE = graphql(`
    mutation MultiselectBlockCreate($input: MultiselectBlockCreateInput!) {
      multiselectBlockCreate(input: $input) {
        id
        journeyId
        parentBlockId
        parentOrder
        min
        max
        submitLabel
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
    label: 'Question label',
    submitLabel: 'Submit',
    min: 1,
    max: 3
  }

  beforeEach(() => {
    jest.clearAllMocks()
    prismaMock.block.findMany.mockResolvedValue([] as any)
  })

  it('creates multiselect block when authorized', async () => {
    fetchJourneyWithAclIncludes.mockResolvedValue({ id: 'journeyId' })
    mockAbility.mockReturnValue(true)

    const tx = {
      block: {
        create: jest.fn().mockResolvedValue({
          id: 'blockId',
          typename: 'MultiselectBlock',
          parentOrder: 0,
          journeyId: 'journeyId',
          parentBlockId: 'parentId',
          min: input.min,
          max: input.max,
          submitLabel: input.submitLabel,
          journey: { id: 'journeyId' }
        }),
        findFirst: jest.fn().mockResolvedValue(null),
        findMany: jest.fn().mockResolvedValue([])
      },
      journey: { update: jest.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const result = await authClient({
      document: MULTISELECT_BLOCK_CREATE,
      variables: { input }
    })

    expect(fetchJourneyWithAclIncludes).toHaveBeenCalledWith('journeyId')
    expect(mockAbility).toHaveBeenCalledWith(
      Action.Update,
      { subject: 'Journey', object: { id: 'journeyId' } },
      expect.any(Object)
    )
    expect(tx.block.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          typename: 'MultiselectBlock',
          journey: { connect: { id: 'journeyId' } },
          parentBlock: { connect: { id: 'parentId' } }
        })
      })
    )
    expect(tx.journey.update).toHaveBeenCalled()

    expect(result).toEqual({
      data: {
        multiselectBlockCreate: expect.objectContaining({
          id: 'blockId',
          journeyId: 'journeyId',
          parentBlockId: 'parentId',
          submitLabel: input.submitLabel
        })
      }
    })
  })

  it('returns FORBIDDEN if unauthorized', async () => {
    fetchJourneyWithAclIncludes.mockResolvedValue({ id: 'journeyId' })
    mockAbility.mockReturnValue(false)

    const result = await authClient({
      document: MULTISELECT_BLOCK_CREATE,
      variables: { input }
    })

    expect(fetchJourneyWithAclIncludes).toHaveBeenCalledWith('journeyId')
    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'user is not allowed to create block'
        })
      ]
    })
  })
})
