import { Story, Meta } from '@storybook/react'
import { EditorProvider, TreeBlock } from '@core/journeys/ui'
import { MockedProvider } from '@apollo/client/testing'
import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_CardBlock as CardBlock
} from '../../../../../../../../__generated__/GetJourney'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../../../../../../__generated__/globalTypes'
import { journeysAdminConfig } from '../../../../../../../libs/storybook'
import { JourneyProvider } from '../../../../../../../libs/context'
import { Drawer } from '../../../../../Drawer'
import { BackgroundColor } from '.'

const BackgroundColorStory = {
  ...journeysAdminConfig,
  component: BackgroundColor,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Card/BackgroundColor',
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
  title: 'my journey',
  slug: 'my-journey',
  locale: 'en-US',
  description: 'my cool journey',
  status: JourneyStatus.draft,
  createdAt: '2021-11-19T12:34:56.647Z',
  publishedAt: null,
  blocks: [] as TreeBlock[],
  primaryImageBlock: null,
  userJourneys: []
}

export const Default: Story = () => {
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
      <JourneyProvider value={journey}>
        <EditorProvider
          initialState={{
            selectedBlock: block,
            drawerChildren: <BackgroundColor />,
            drawerTitle: 'Background Color Properties',
            drawerMobileOpen: true
          }}
        >
          <Drawer />
        </EditorProvider>
      </JourneyProvider>
    </MockedProvider>
  )
}

export const Colored: Story = () => {
  const block: TreeBlock<CardBlock> = {
    id: 'card1.id',
    __typename: 'CardBlock',
    parentBlockId: 'step1.id',
    parentOrder: 0,
    coverBlockId: null,
    backgroundColor: '#DCDDE5',
    themeMode: null,
    themeName: null,
    fullscreen: false,
    children: []
  }

  return (
    <MockedProvider>
      <JourneyProvider value={journey}>
        <EditorProvider
          initialState={{
            selectedBlock: block,
            drawerChildren: <BackgroundColor />,
            drawerTitle: 'Background Color Properties',
            drawerMobileOpen: true
          }}
        >
          <Drawer />
        </EditorProvider>
      </JourneyProvider>
    </MockedProvider>
  )
}

export default BackgroundColorStory as Meta
