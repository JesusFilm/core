import { Story, Meta } from '@storybook/react'
import { EditorProvider, TreeBlock } from '@core/journeys/ui'
import { MockedProvider } from '@apollo/client/testing'

import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_CardBlock as CardBlock,
  GetJourney_journey_blocks_ImageBlock as ImageBlock
} from '../../../../../../../../__generated__/GetJourney'
import { simpleComponentConfig } from '../../../../../../../libs/storybook'
import { JourneyProvider } from '../../../../../../../libs/context'
import {
  ThemeMode,
  ThemeName,
  JourneyStatus
} from '../../../../../../../../__generated__/globalTypes'
import { ThemeProvider } from '../../../../../../ThemeProvider'
import { Drawer } from '../../../../../Drawer'
import { BackgroundMedia } from '.'

const BackgroundMediaStory = {
  ...simpleComponentConfig,
  component: BackgroundMedia,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Card/BackgroundMedia',
  parameters: {
    ...simpleComponentConfig.parameters,
    layout: 'fullscreen',
    chromatic: {
      ...simpleComponentConfig.parameters.chromatic,
      viewports: [360, 600]
    }
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
  const image: TreeBlock<ImageBlock> = {
    id: 'image1.id',
    __typename: 'ImageBlock',
    parentBlockId: '3',
    parentOrder: 0,
    src: 'https://source.unsplash.com/random/1920x1080',
    alt: 'random image from unsplash',
    width: 1920,
    height: 1080,
    blurhash: '',
    children: []
  }
  const block: TreeBlock<CardBlock> = {
    id: 'card1.id',
    __typename: 'CardBlock',
    parentBlockId: 'step1.id',
    parentOrder: 0,
    coverBlockId: null,
    backgroundColor: null,
    themeMode: ThemeMode.light,
    themeName: null,
    fullscreen: true,
    children: [image]
  }

  return (
    <MockedProvider>
      <ThemeProvider>
        <JourneyProvider value={journey}>
          <EditorProvider
            initialState={{
              selectedBlock: block,
              drawerChildren: <BackgroundMedia />,
              drawerTitle: 'Background Media',
              drawerMobileOpen: true
            }}
          >
            <Drawer />
          </EditorProvider>
        </JourneyProvider>
      </ThemeProvider>
    </MockedProvider>
  )
}

export default BackgroundMediaStory as Meta
