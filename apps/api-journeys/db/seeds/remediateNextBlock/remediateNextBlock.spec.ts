import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'

import {
  Action,
  Block,
  Journey,
  PrismaClient,
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

describe('remediateNextBlock', () => {
  const step = {
    id: 'step0.id',
    typename: 'StepBlock',
    journeyId: 'journeyId',
    parentBlockId: null,
    parentOrder: 0,
    locked: false,
    nextBlockId: null
  } as unknown as Block

  const step1 = {
    ...step,
    id: 'step1.id'
  } as unknown as Block

  const step2 = {
    ...step,
    id: 'step2.id'
  } as unknown as Block

  const button = {
    typename: 'ButtonBlock',
    id: 'button',
    parentBlockId: 'step0.id',
    parentOrder: 0,
    label: 'This is a button',
    size: 'small',
    startIconId: null,
    endIconId: null,
    action: {
      gtmEventName: 'gtmEventName',
      blockId: null,
      journeyId: null,
      url: null,
      email: null
    }
  }

  const button1 = {
    ...button,
    typename: 'ButtonBlock',
    id: 'button2',
    parentBlockId: 'step1.id',
    parentOrder: 0,
    label: 'This is a button',
    buttonVariant: 'contained',
    buttonColor: 'primary',
    size: 'small',
    startIconId: null,
    endIconId: null,
    action: {
      gtmEventName: 'gtmEventName',
      blockId: null,
      journeyId: null,
      url: null,
      email: null
    }
  }

  const button2 = {
    typename: 'ButtonBlock',
    id: 'button3',
    parentBlockId: 'step2.id',
    parentOrder: 0,
    label: 'This is a button',
    buttonVariant: 'contained',
    buttonColor: 'primary',
    size: 'small',
    startIconId: null,
    endIconId: null,
    action: {
      gtmEventName: 'gtmEventName',
      blockId: null,
      journeyId: null,
      url: null,
      email: null
    }
  }

  const blocks = [
    step,
    button,
    step1,
    button1,
    step2,
    button2
  ] as unknown as Array<Block & { action?: Action | null }>

  const steps = [step, step1, step2]

  const actions = [button, button1, button2]

  const journey: Journey & { blocks: Block[] } = {
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
    publishedAt: new Date('2021-11-19T12:34:56.647Z'),
    createdAt: new Date('2021-11-19T12:34:56.647Z'),
    updatedAt: new Date('2021-11-19T12:34:56.647Z'),
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

  const journeys: Journey[] = [
    journey,
    { ...journey, id: 'journeyId2' },
    { ...journey, id: 'journeyId3' }
  ]

  beforeEach(() => {
    mockReset(prismaMock)
  })

  it('should update next block id of step and action', async () => {
    prismaMock.journey.findMany.mockResolvedValueOnce([])
    prismaMock.journey.findMany.mockResolvedValueOnce(journeys)

    await remediateNextBlock()
  })

  it('should update next block id of just action if step already has next block id', async () => {
    prismaMock.journey.findMany.mockResolvedValueOnce(journeys)
    await remediateNextBlock()
  })

  it('should delete the action of the last step', async () => {
    prismaMock.journey.findMany.mockResolvedValueOnce(journeys)
    await remediateNextBlock()
  })
})
