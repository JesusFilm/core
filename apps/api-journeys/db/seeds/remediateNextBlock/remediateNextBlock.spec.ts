import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'

import {
  Action,
  Block as PrismaBlock,
  PrismaClient,
  Journey as PrismaJourney,
  ThemeMode,
  ThemeName
} from '.prisma/api-journeys-client'

import { JourneyStatus } from '../../../src/app/__generated__/graphql'

import prisma from './prisma'
import { remediateNextBlock } from './remediateNextBlock'

jest.mock('./prisma', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>()
}))

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>

type Block = PrismaBlock & { action?: Action | null }

type Journey = PrismaJourney & { blocks: Block[] }

describe('remediateNextBlock', () => {
  const step: Partial<Block> = {
    id: 'step0.id',
    typename: 'StepBlock',
    journeyId: 'journeyId',
    parentBlockId: null,
    parentOrder: 0,
    locked: false,
    nextBlockId: null
  }

  const card: Partial<Block> = {
    id: 'card0.id',
    typename: 'CardBlock',
    journeyId: 'journeyId',
    parentBlockId: 'step0.id',
    parentOrder: 0,
    locked: false,
    nextBlockId: null
  }

  const button: Partial<Block> = {
    typename: 'ButtonBlock',
    id: 'button0.id',
    parentBlockId: 'card0.id',
    parentOrder: 0,
    label: 'This is a button',
    size: 'small',
    startIconId: null,
    endIconId: null,
    action: {
      parentBlockId: 'button0.id',
      gtmEventName: 'NavigateAction',
      blockId: null,
      journeyId: null,
      url: null,
      email: null,
      target: null,
      updatedAt: new Date()
    }
  }

  const button1: Partial<Block> = {
    typename: 'ButtonBlock',
    id: 'button1.id',
    parentBlockId: 'card0.id',
    parentOrder: 0,
    label: 'This is a button',
    size: 'small',
    startIconId: null,
    endIconId: null,
    action: {
      parentBlockId: 'button1.id',
      gtmEventName: 'EmailAction',
      blockId: null,
      journeyId: null,
      url: null,
      email: 'test@example.com',
      target: null,
      updatedAt: new Date()
    }
  }

  const blocks = [step, card, button, button1] as unknown as Block[]

  const journey: Journey = {
    id: 'journeyId',
    slug: 'journey-slug',
    title: 'published',
    status: JourneyStatus.published,
    languageId: '529',
    themeMode: ThemeMode.light,
    themeName: ThemeName.base,
    description: null,
    creatorDescription: null,
    creatorImageBlockId: null,
    primaryImageBlockId: null,
    teamId: 'teamId',
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    archivedAt: null,
    trashedAt: null,
    featuredAt: null,
    deletedAt: null,
    seoTitle: null,
    seoDescription: null,
    template: false,
    hostId: null,
    strategySlug: null,
    blocks
  }

  const journeyWithStepWithNextBlockId = {
    ...journey,
    blocks: [
      card,
      { ...step, nextBlockId: 'step1.id' },
      { ...step, id: 'step1.id' },
      button
    ]
  }

  const journeyWithStepWithoutNextBlockId = {
    ...journey,
    blocks: [card, step, { ...step, id: 'step1.id' }, button]
  }

  beforeEach(() => {
    mockReset(prismaMock)
  })

  it('should delete all actions of blocks', async () => {
    prismaMock.journey.findMany.mockResolvedValue([])
    await remediateNextBlock()
    expect(prismaMock.action.deleteMany).toHaveBeenCalledWith({
      where: { parentBlock: { typename: 'StepBlock' } }
    })
  })

  it('should delete the action of block contained in the last step', async () => {
    prismaMock.journey.findMany.mockResolvedValue([])
    prismaMock.journey.findMany.mockResolvedValueOnce([journey])
    await remediateNextBlock()
    expect(prismaMock.action.delete).toHaveBeenCalledWith({
      where: { parentBlockId: 'button0.id' }
    })
  })

  it('should update nextBlockId of actions in steps when step is not last and has nextBlockId', async () => {
    prismaMock.journey.findMany.mockResolvedValue([])
    prismaMock.journey.findMany.mockResolvedValueOnce([
      journeyWithStepWithNextBlockId
    ])
    await remediateNextBlock()
    expect(prismaMock.action.update).toHaveBeenCalledWith({
      where: { parentBlockId: 'button0.id' },
      data: {
        gtmEventName: 'NavigateToBlockAction',
        blockId: 'step1.id'
      }
    })
  })

  it('should update nextBlockId of actions in steps when step is not last and has no nextBlockId', async () => {
    prismaMock.journey.findMany.mockResolvedValue([])
    prismaMock.journey.findMany.mockResolvedValueOnce([
      journeyWithStepWithoutNextBlockId
    ])
    await remediateNextBlock()
    expect(prismaMock.block.update).toHaveBeenCalledWith({
      where: { id: 'step0.id' },
      data: { nextBlockId: 'step1.id' }
    })
    expect(prismaMock.action.update).toHaveBeenCalledWith({
      where: { parentBlockId: 'button0.id' },
      data: {
        gtmEventName: 'NavigateToBlockAction',
        blockId: 'step1.id'
      }
    })
  })
})
