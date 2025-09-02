import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent } from '@storybook/test'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../../../../__generated__/globalTypes'

import { SocialDetails } from './SocialDetails'

const SocialDetailsStory: Meta<typeof SocialDetails> = {
  ...journeysAdminConfig,
  component: SocialDetails,
  title: 'Journeys-Admin/Editor/Slider/Settings/SocialDetails',
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
  strategySlug: null,
  slug: 'my-journey',
  featuredAt: null,
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
  description: null,
  status: JourneyStatus.draft,
  createdAt: '2021-11-19T12:34:56.647Z',
  updatedAt: '2021-11-19T12:34:56.647Z',
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
  tags: [],
  website: null,
  showShareButton: null,
  showLikeButton: null,
  showDislikeButton: null,
  displayTitle: null,
  logoImageBlock: null,
  menuButtonIcon: null,
  menuStepBlock: null,
  journeyTheme: null
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
  blurhash: '',
  scale: null,
  focalLeft: 50,
  focalTop: 50
}

const Template: StoryObj<typeof SocialDetails> = {
  render: ({ ...args }) => {
    return (
      <MockedProvider>
        <JourneyProvider value={{ journey: args.journey, variant: 'admin' }}>
          <EditorProvider>
            <SocialDetails />
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

export default SocialDetailsStory
