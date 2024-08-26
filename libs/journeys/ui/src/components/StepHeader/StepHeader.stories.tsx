import { MockedProvider } from '@apollo/client/testing'
import Stack from '@mui/material/Stack'
import { Meta, StoryObj } from '@storybook/react'
import { SnackbarProvider } from 'notistack'
import { ComponentPropsWithoutRef } from 'react'

import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../__generated__/globalTypes'
import { TreeBlock, blockHistoryVar, treeBlocksVar } from '../../libs/block'
import { BlockFields_StepBlock as StepBlock } from '../../libs/block/__generated__/BlockFields'
import { JourneyProvider } from '../../libs/JourneyProvider'
import { JourneyFields as Journey } from '../../libs/JourneyProvider/__generated__/JourneyFields'
import { journeyUiConfig } from '../../libs/journeyUiConfig'

import { StepHeader } from '.'

const Demo: Meta<typeof StepHeader> = {
  ...journeyUiConfig,
  component: StepHeader,
  title: 'Journeys-Ui/StepHeader',
  parameters: {
    ...journeyUiConfig.parameters,
    layout: 'fullscreen'
  }
}

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
        __typename: 'LanguageName',
        value: 'English',
        primary: true
      }
    ]
  },
  description: 'my cool journey',
  status: JourneyStatus.draft,
  createdAt: '2021-11-19T12:34:56.647Z',
  publishedAt: null,
  blocks: [],
  primaryImageBlock: null,
  creatorDescription: null,
  creatorImageBlock: null,
  userJourneys: [],
  template: null,
  seoTitle: null,
  seoDescription: null,
  chatButtons: [],
  host: null,
  team: { __typename: 'Team', id: 'teamId', title: 'My Team', publicTitle: '' },
  tags: [],
  website: null,
  showShareButton: null,
  showLikeButton: null,
  showDislikeButton: null,
  displayTitle: null
}

const step1: TreeBlock<StepBlock> = {
  id: 'step1.id',
  __typename: 'StepBlock',
  parentBlockId: null,
  parentOrder: 0,
  locked: false,
  nextBlockId: 'step2.id',
  children: []
}
const step2: TreeBlock<StepBlock> = {
  id: 'step2.id',
  __typename: 'StepBlock',
  parentBlockId: null,
  parentOrder: 1,
  locked: false,
  nextBlockId: 'step3.id',
  children: []
}
const step3: TreeBlock<StepBlock> = {
  id: 'step3.id',
  __typename: 'StepBlock',
  parentBlockId: null,
  parentOrder: 2,
  locked: false,
  nextBlockId: 'step4.id',
  children: []
}

type Story = StoryObj<
  ComponentPropsWithoutRef<typeof StepHeader> & {
    journey: Journey
    variant: 'default' | 'admin' | 'embed'
  }
>

const Template: Story = {
  render: ({ journey, variant }) => {
    treeBlocksVar([step1, step2, step3])
    blockHistoryVar([step1])
    return (
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider value={{ journey, variant }}>
            <Stack
              sx={{
                position: 'relative',
                height: { xs: 119, sm: 70, lg: 78 },
                justifyContent: 'center'
              }}
            >
              <StepHeader />
            </Stack>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
  }
}

export const Default = {
  ...Template,
  args: {
    journey: defaultJourney,
    variant: 'default'
  }
}

export default Demo
