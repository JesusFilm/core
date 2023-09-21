import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent } from '@storybook/testing-library'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  GetJourney_journey_blocks_ImageBlock as ImageBlock,
  GetJourney_journey as Journey
} from '../../../../../__generated__/GetJourney'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../../../__generated__/globalTypes'
import { journeysAdminConfig } from '../../../../libs/storybook'
import { Drawer } from '../Drawer'

import { SocialShareAppearance } from './SocialShareAppearance'

const SocialShareAppearanceStory: Meta<typeof SocialShareAppearance> = {
  ...journeysAdminConfig,
  component: SocialShareAppearance,
  title: 'Journeys-Admin/Editor/Drawer/SocialShareAppearance',
  // do not remove these parameters for this story, see: https://github.com/storybookjs/storybook/issues/17025
  parameters: {
    docs: {
      source: { type: 'code' }
    }
  }
}

const journey: Journey = {
  __typename: 'Journey',
  id: 'journeyId',
  themeName: ThemeName.base,
  themeMode: ThemeMode.light,
  title: 'my journey',
  strategySlug: 'https://www.canva.com/design/DAFvDBw1z1A/view',
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
  description: null,
  status: JourneyStatus.draft,
  createdAt: '2021-11-19T12:34:56.647Z',
  publishedAt: null,
  blocks: [] as TreeBlock[],
  primaryImageBlock: null,
  userJourneys: [],
  template: null,
  seoTitle: null,
  seoDescription: null,
  chatButtons: [],
  host: null,
  team: null
}

const image: ImageBlock = {
  id: 'image1.id',
  __typename: 'ImageBlock',
  parentBlockId: null,
  parentOrder: 0,
  src: 'https://images.unsplash.com/photo-1649866725673-16dc15de5c29?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1009&q=80',
  alt: 'image.jpg',
  width: 1920,
  height: 1080,
  blurhash: ''
}

const Template: StoryObj<typeof SocialShareAppearance> = {
  render: ({ ...args }) => {
    return (
      <MockedProvider>
        <JourneyProvider value={{ journey: args.journey, variant: 'admin' }}>
          <EditorProvider
            initialState={{
              drawerTitle: 'Social Share Preview',
              drawerChildren: <SocialShareAppearance />,
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

export const Default = { ...Template, args: { journey } }

export const Filled = {
  ...Template,
  args: {
    journey: {
      ...journey,
      blocks: [image],
      primaryImageBlock: image,
      seoTitle: 'Social title',
      seoDescription: 'Social description',
      status: 'published'
    }
  }
}

export const Max = {
  ...Template,
  args: {
    journey: {
      ...journey,
      blocks: [image],
      primaryImageBlock: image,
      seoTitle: 'Lorem ipsum dolor sit amet, consectetuer adipiscin',
      seoDescription:
        'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur rid'
    }
  }
}

export const Loading = { ...Template, args: { journey: null } }

export const NoImageDialog = {
  ...Template,
  args: { journey },
  play: async () => {
    await userEvent.click(screen.getByRole('button', { name: 'Change' }))
  }
}

export const ImageDialog = {
  ...Template,
  args: {
    journey: {
      ...journey,
      blocks: [image],
      primaryImageBlock: image,
      seoTitle: 'Social title',
      seoDescription: 'Social description'
    }
  },
  play: async () => {
    await userEvent.click(screen.getByRole('button', { name: 'Change' }))
  }
}

export default SocialShareAppearanceStory
