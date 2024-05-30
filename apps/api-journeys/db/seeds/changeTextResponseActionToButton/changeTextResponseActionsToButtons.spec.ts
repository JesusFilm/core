import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'

import { Block, Prisma, PrismaClient } from '.prisma/api-journeys-client'

import { changeTextResponseActionsToButtons } from './changeTextResponseActionsToButtons'
import prisma from './client'

jest.mock('./client', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>()
}))

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('id')
}))

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>

type TextResponseBlockWithAction = Prisma.BlockGetPayload<{
  include: {
    action: true
  }
}>

describe('changeTextResponseActionsToButtons', () => {
  beforeEach(() => {
    mockReset(prismaMock)
    jest
      .spyOn(prisma, '$transaction')
      .mockImplementation(async (callback) => await callback(prismaMock))
  })

  it('should fetch text responses that have actions', async () => {
    prismaMock.block.findMany.mockResolvedValue([])
    await changeTextResponseActionsToButtons()

    expect(prismaMock.block.findMany).toHaveBeenCalledWith({
      include: { action: true },
      where: { action: { isNot: null }, typename: 'TextResponseBlock' }
    })
  })

  it('should throw error if parent order is null', async () => {
    prismaMock.block.findMany.mockResolvedValue([
      {
        id: 'someId',
        typename: 'TextResponseBlock',
        journeyId: 'journeyId',
        parentBlockId: 'parentBlockId',
        parentOrder: null
      } as unknown as TextResponseBlockWithAction
    ])

    await expect(changeTextResponseActionsToButtons()).rejects.toThrow(
      'missing parentOrder for: someId'
    )
  })

  it('should throw error if action is null', async () => {
    prismaMock.block.findMany.mockResolvedValue([
      {
        id: 'someId',
        typename: 'TextResponseBlock',
        journeyId: 'journeyId',
        parentBlockId: 'parentBlockId',
        parentOrder: 'something'
      } as unknown as TextResponseBlockWithAction
    ])

    await expect(changeTextResponseActionsToButtons()).rejects.toThrow(
      'missing action for: someId'
    )
  })

  it('should throw error if parentBlockId is null', async () => {
    prismaMock.block.findMany.mockResolvedValue([
      {
        id: 'someId',
        typename: 'TextResponseBlock',
        journeyId: 'journeyId',
        parentBlockId: null,
        parentOrder: 1
      } as unknown as TextResponseBlockWithAction
    ])

    await expect(changeTextResponseActionsToButtons()).rejects.toThrow(
      'missing parentBlockId for: someId'
    )
  })

  it('should migrate text response actions to buttons', async () => {
    prismaMock.block.findMany.mockResolvedValue([
      {
        id: 'someId',
        typename: 'TextResponseBlock',
        journeyId: 'journeyId',
        parentBlockId: 'parentBlockId',
        parentOrder: 1,
        action: { parentBlockId: 'someId' },
        submitLabel: 'Something',
        submitIconId: 'submitIconId'
      } as unknown as TextResponseBlockWithAction,
      {
        id: 'someId',
        typename: 'TextResponseBlock',
        journeyId: 'journeyId',
        parentBlockId: 'parentBlockId',
        parentOrder: 1,
        action: { parentBlockId: 'someId' }
      } as unknown as TextResponseBlockWithAction
    ])
    prismaMock.block.create.mockResolvedValue({
      id: 'buttonBlockId',
      typename: 'ButtonBlock',
      parentOrder: 1,
      startIconId: null,
      endIconId: null
    } as unknown as Block)

    await changeTextResponseActionsToButtons()

    expect(prismaMock.block.create).toHaveBeenCalledWith({
      data: {
        id: 'id',
        journey: {
          connect: {
            id: 'journeyId'
          }
        },
        label: 'Something',
        parentBlock: {
          connect: {
            id: 'parentBlockId'
          }
        },
        parentOrder: 2,
        startIconId: 'submitIconId',
        typename: 'ButtonBlock'
      }
    })

    expect(prismaMock.action.update).toHaveBeenCalledWith({
      data: {
        parentBlockId: 'buttonBlockId'
      },
      where: {
        parentBlockId: 'someId'
      }
    })

    expect(prismaMock.block.update).toHaveBeenNthCalledWith(1, {
      data: {
        parentBlockId: 'buttonBlockId'
      },
      where: {
        id: 'submitIconId'
      }
    })
    expect(prismaMock.block.update).toHaveBeenNthCalledWith(2, {
      data: {
        submitIconId: null
      },
      where: {
        id: 'someId'
      }
    })
  })
})
