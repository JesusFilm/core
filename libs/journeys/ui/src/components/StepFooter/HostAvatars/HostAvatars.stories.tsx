import Stack from '@mui/material/Stack'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { FlagsProvider } from '@core/shared/ui/FlagsProvider'

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
  title: 'Journeys-Ui/StepFooter/HostAvatars',
  parameters: {
    ...simpleComponentConfig.parameters
  }
}

const hostData = {
  id: 'hostId',
  __typename: 'Host' as const,
  teamId: 'teamId',
  title: 'Cru International',
  location: 'Florida, USA',
  src1: 'https://tinyurl.com/3bxusmyb',
  src2: null
}

const journey: Journey = {
  __typename: 'Journey',
  id: 'journeyId',
  themeName: ThemeName.base,
  themeMode: ThemeMode.light,
  title: 'my journey',
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
  blocks: [],
  primaryImageBlock: null,
  userJourneys: [],
  template: null,
  seoTitle: 'My awesome journey',
  seoDescription: null,
  chatButtons: [],
  host: hostData,
  team: null
}

type Story = StoryObj<
  ComponentProps<typeof HostAvatars> & {
    variant: 'default' | 'admin' | 'embed'
    journey: Journey
    editableStepFooter: boolean
  }
>

const Template: Story = {
  render: ({ variant = 'default', journey, editableStepFooter, ...args }) => (
    <FlagsProvider flags={{ editableStepFooter }}>
      <JourneyProvider value={{ variant, journey }}>
        <Stack direction="row">
          <HostAvatars hasPlaceholder={variant === 'admin'} {...args} />
        </Stack>
      </JourneyProvider>
    </FlagsProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    journey,
    editableStepFooter: true
  }
}

export const Empty = {
  ...Template,
  args: {
    editableStepFooter: true,
    variant: 'admin',
    journey: { ...journey, host: { ...hostData, src1: null } }
  }
}

export const WithPlaceholder = {
  ...Template,
  args: {
    ...Empty.args,
    journey
  }
}

export const Placeholder = {
  ...Template,
  args: {
    ...Empty.args,
    size: 'large'
  }
}

export const TwoAvatars = {
  ...Template,
  args: {
    ...Empty.args,
    journey: {
      ...journey,
      host: { ...hostData, src2: 'https://tinyurl.com/2nxtwn8v' }
    }
  }
}

export const Large = {
  ...Template,
  args: {
    ...Default.args,
    size: 'large'
  }
}

export default HostAvatarsDemo
