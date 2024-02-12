import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { TreeBlock, useBlocks } from '../../../libs/block'
import { JourneyProvider } from '../../../libs/JourneyProvider'
import { journeyUiConfig } from '../../../libs/journeyUiConfig'
import { StepFields } from '../../Step/__generated__/StepFields'
import {
  JourneyFields as Journey,
  JourneyFields_language as Language
} from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'

import { PaginationBullets } from './PaginationBullets'
import {
  ThemeName,
  ThemeMode,
  JourneyStatus
} from '../../../../__generated__/globalTypes'
import { basic } from '../../../../../../../../core/apps/journeys/src/libs/testData/storyData'

const Demo: Meta<typeof PaginationBullets> = {
  ...journeyUiConfig,
  component: PaginationBullets,
  title: 'Journeys-Ui/StepHeader/PaginationBullets'
}

const treeBlocks: Array<TreeBlock<StepFields>> = [
  {
    __typename: 'StepBlock',
    id: '1',
    locked: false,
    nextBlockId: null,
    parentBlockId: null,
    parentOrder: 0,
    children: []
  },
  {
    __typename: 'StepBlock',
    id: '2',
    locked: false,
    nextBlockId: null,
    parentBlockId: null,
    parentOrder: 1,
    children: []
  },
  {
    __typename: 'StepBlock',
    id: '3',
    locked: false,
    nextBlockId: null,
    parentBlockId: null,
    parentOrder: 2,
    children: []
  }
]

const defaultJourney: Journey = {
  __typename: 'Journey',
  id: 'journeyId',
  themeName: ThemeName.base,
  themeMode: ThemeMode.light,
  title: 'my journey',
  featuredAt: null,
  strategySlug: null,
  slug: 'my-journey',
  language: {
    __typename: 'Language',
    id: '529',
    bcp47: 'en',
    iso3: 'eng',
    name: [
      {
        __typename: 'Translation',
        value: 'English',
        primary: true
      }
    ]
  },
  description: 'my cool journey',
  status: JourneyStatus.draft,
  createdAt: '2021-11-19T12:34:56.647Z',
  publishedAt: null,
  blocks: basic,
  primaryImageBlock: null,
  creatorDescription: null,
  creatorImageBlock: null,
  userJourneys: [],
  template: null,
  seoTitle: null,
  seoDescription: null,
  chatButtons: [],
  host: null,
  team: null,
  tags: []
}

const blockHistory: Array<TreeBlock<StepFields>> = [
  {
    __typename: 'StepBlock',
    id: '1',
    parentBlockId: null,
    parentOrder: 0,
    locked: false,
    nextBlockId: null,
    children: []
  }
]

type Story = StoryObj<
  ComponentProps<typeof PaginationBullets> & { blocks: Array<TreeBlock> }
>
const Template: Story = {
  render: ({ blocks, ...args }) => {
    const { setTreeBlocks, blockHistory, showHeaderFooter } = useBlocks()
    setTreeBlocks(blocks)
    return <PaginationBullets />
  }
}

export const Default = {
  ...Template,
  args: { blocks: basic }
}

export default Demo
