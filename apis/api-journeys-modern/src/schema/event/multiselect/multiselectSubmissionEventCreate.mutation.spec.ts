import { prismaMock } from '../../../../test/prismaMock'
import { graphql } from '../../../lib/graphql/subgraphGraphql'

// Ensure $transaction is a thenable before schema/yoga are imported
// The Pothos Prisma plugin calls prisma.$transaction during schema build
// so this must be defined at module load time
prismaMock.$transaction.mockImplementation((arg: any) => {
  if (typeof arg === 'function') {
    const result = arg(prismaMock as any)
    return Promise.resolve(result)
  }
  return Promise.resolve(arg)
})

describe.skip('multiselectSubmissionEventCreate', () => {
  const mockUser = { id: 'userId' }
  const { getClient } = require('../../../../test/client')
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const MULTISELECT_SUBMISSION_EVENT_CREATE = graphql(`
    mutation MultiselectSubmissionEventCreate($input: MultiselectSubmissionEventCreateInput!) {
      multiselectSubmissionEventCreate(input: $input) {
        id
        journeyId
        createdAt
        label
        value
      }
    }
  `)

  const input = {
    id: 'evt-1',
    blockId: 'blockId',
    stepId: 'stepId',
    label: 'Question label',
    values: ['Option A', 'Option B']
  }

  beforeEach(() => {
    jest.clearAllMocks()
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(prismaMock as any))
    // validateBlockEvent dependencies
    prismaMock.block.findUnique.mockResolvedValue({
      id: 'blockId',
      journeyId: 'journeyId'
    } as any)
    // validateBlock(stepId, journeyId)
    prismaMock.block.findFirst.mockResolvedValue({
      id: 'stepId',
      journeyId: 'journeyId',
      deletedAt: null
    } as any)
    prismaMock.visitor.findFirst.mockResolvedValue({ id: 'visitorId' } as any)
    prismaMock.journeyVisitor.findUnique.mockResolvedValue({
      journeyId: 'journeyId',
      visitorId: 'visitorId',
      activityCount: 0
    } as any)
  })

  it('creates MultiselectSubmissionEvent', async () => {
    const created = {
      id: input.id,
      typename: 'MultiselectSubmissionEvent',
      journeyId: 'journeyId',
      createdAt: new Date().toISOString(),
      label: input.label,
      value: input.values.join(', ')
    } as any
    prismaMock.event.create.mockResolvedValue(created)
    // ensure dataloader can re-fetch by id if needed
    ;(prismaMock as any).event.findUnique.mockResolvedValue(created)

    prismaMock.journeyVisitor.update.mockResolvedValue({} as any)

    const result = await authClient({
      document: MULTISELECT_SUBMISSION_EVENT_CREATE,
      variables: { input }
    })

    expect(prismaMock.event.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id: input.id,
          typename: 'MultiselectSubmissionEvent',
          journey: { connect: { id: 'journeyId' } },
          blockId: input.blockId,
          stepId: input.stepId,
          label: input.label,
          value: input.values.join(', '),
          visitor: { connect: { id: 'visitorId' } }
        })
      })
    )

    expect(prismaMock.journeyVisitor.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          journeyId_visitorId: { journeyId: 'journeyId', visitorId: 'visitorId' }
        },
        data: { activityCount: 1 }
      })
    )

    expect(result).toEqual(
      expect.objectContaining({
        data: {
          multiselectSubmissionEventCreate: expect.objectContaining({
            id: input.id,
            journeyId: 'journeyId',
            label: input.label
          })
        }
      })
    )
  })
})

