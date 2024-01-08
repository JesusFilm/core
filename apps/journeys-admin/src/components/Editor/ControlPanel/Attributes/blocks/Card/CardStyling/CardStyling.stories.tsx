import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  GetJourney_journey_blocks_CardBlock as CardBlock,
  GetJourney_journey as Journey
} from '../../../../../../../../__generated__/GetJourney'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../../../../../../__generated__/globalTypes'
import { journeysAdminConfig } from '../../../../../../../libs/storybook'
import { Drawer } from '../../../../../Drawer'

import { CardStyling } from '.'

const CardStylingStory: Meta<typeof CardStyling> = {
  ...journeysAdminConfig,
  component: CardStyling,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Card/CardStyling',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const journey: Journey = {
  __typename: 'Journey',
  id: 'journeyId',
  themeName: ThemeName.base,
  themeMode: ThemeMode.light,
  featuredAt: null,
  title: 'my journey',
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
  blocks: [] as TreeBlock[],
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

export const Default: StoryObj<typeof CardStyling> = {
  render: () => {
    const block: TreeBlock<CardBlock> = {
      id: 'card1.id',
      __typename: 'CardBlock',
      parentBlockId: 'step1.id',
      parentOrder: 0,
      coverBlockId: null,
      backgroundColor: null,
      themeMode: null,
      themeName: null,
      fullscreen: false,
      children: []
    }

    return (
      <MockedProvider>
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <EditorProvider
            initialState={{
              selectedBlock: block,
              drawerChildren: <CardStyling />,
              drawerTitle: 'Card Style Property',
              drawerMobileOpen: true
            }}
          >
            <Drawer />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
  }
}

export const Light: StoryObj<typeof CardStyling> = {
  render: () => {
    const block: TreeBlock<CardBlock> = {
      id: 'card1.id',
      __typename: 'CardBlock',
      parentBlockId: 'step1.id',
      parentOrder: 0,
      coverBlockId: null,
      backgroundColor: null,
      themeMode: ThemeMode.light,
      themeName: null,
      fullscreen: false,
      children: []
    }

    return (
      <MockedProvider>
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <EditorProvider
            initialState={{
              selectedBlock: block,
              drawerChildren: <CardStyling />,
              drawerTitle: 'Card Style Property',
              drawerMobileOpen: true
            }}
          >
            <Drawer />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
  }
}

export const Dark: StoryObj<typeof CardStyling> = {
  render: () => {
    const block: TreeBlock<CardBlock> = {
      id: 'card1.id',
      __typename: 'CardBlock',
      parentBlockId: 'step1.id',
      parentOrder: 0,
      coverBlockId: null,
      backgroundColor: null,
      themeMode: ThemeMode.dark,
      themeName: null,
      fullscreen: false,
      children: []
    }

    return (
      <MockedProvider>
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <EditorProvider
            initialState={{
              selectedBlock: block,
              drawerChildren: <CardStyling />,
              drawerTitle: 'Card Style Property',
              drawerMobileOpen: true
            }}
          >
            <Drawer />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
  }
}

export default CardStylingStory
