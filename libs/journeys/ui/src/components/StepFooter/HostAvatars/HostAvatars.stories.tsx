import Stack from '@mui/material/Stack'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../../__generated__/globalTypes'
import { JourneyProvider } from '../../../libs/JourneyProvider'
import { JourneyFields as Journey } from '../../../libs/JourneyProvider/__generated__/JourneyFields'
import { simpleComponentConfig } from '../../../libs/simpleComponentConfig'

import { HostAvatars } from './HostAvatars'

const HostAvatarsDemo: Meta<typeof HostAvatars> = {
  ...simpleComponentConfig,
  component: HostAvatars,
  title: 'Journeys-Ui/StepFooter/HostAvatars'
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
        __typename: 'LanguageName',
        value: 'English',
        primary: true
      }
    ]
  },
  description: 'my cool journey',
  status: JourneyStatus.draft,
  createdAt: '2021-11-19T12:34:56.647Z',
  updatedAt: '2021-11-19T12:34:56.647Z',
  publishedAt: null,
  blocks: [],
  primaryImageBlock: null,
  creatorDescription: null,
  creatorImageBlock: null,
  userJourneys: [],
  template: null,
  seoTitle: 'My awesome journey',
  seoDescription: null,
  chatButtons: [],
  host: {
    id: 'hostId',
    __typename: 'Host',
    teamId: 'teamId',
    title: 'Cru International',
    location: 'Florida, USA',
    src1: null,
    src2: null
  },
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
  journeyTheme: null,
  journeyCustomizationDescription: null,
  journeyCustomizationFields: [],
  fromTemplateId: null,
  socialNodeX: null,
  socialNodeY: null
}

const Template: StoryObj<ComponentProps<typeof HostAvatars>> = {
  render: ({ ...args }) => (
    <JourneyProvider value={{ journey }}>
      <Stack direction="row">
        <HostAvatars {...args} />
      </Stack>
    </JourneyProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    avatarSrc1: 'https://tinyurl.com/3bxusmyb'
  }
}

export const AdminEmpty = {
  ...Template,
  args: {
    hasPlaceholder: true
  }
}

export const AdminOneAvatar = {
  ...Template,
  args: {
    hasPlaceholder: true,
    avatarSrc1: 'https://tinyurl.com/3bxusmyb'
  }
}

export const Placeholder = {
  ...Template,
  args: {
    hasPlaceholder: true,
    size: 'large'
  }
}

export const TwoAvatars = {
  ...Template,
  args: {
    avatarSrc1: 'https://tinyurl.com/3bxusmyb',
    avatarSrc2: 'https://tinyurl.com/2nxtwn8v'
  }
}

export const Large = {
  ...Template,
  args: {
    hasPlaceholder: true,
    size: 'large'
  }
}

export default HostAvatarsDemo
