import { ComponentProps } from 'react'
import { Story, Meta } from '@storybook/react'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import Stack from '@mui/material/Stack'
import { JourneyProvider } from '../../../libs/JourneyProvider'
import { journeyUiConfig } from '../../../libs/journeyUiConfig'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../../__generated__/globalTypes'
import { JourneyFields as Journey } from '../../../libs/JourneyProvider/__generated__/JourneyFields'
import { HostAvatars } from './HostAvatars'

const HostAvatarsDemo = {
  ...journeyUiConfig,
  component: HostAvatars,
  title: 'Journeys-Ui/StepFooter/HostAvatars',
  parameters: {
    ...journeyUiConfig.parameters
  }
}
const hostData = {
  id: 'hostId',
  __typename: 'Host' as const,
  teamId: 'teamId',
  title: 'Cru International',
  location: 'Florida, USA',
  src1: 'http://surl.li/iauzf',
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
  host: hostData
}

const Template: Story<
  ComponentProps<typeof HostAvatars> & {
    admin: boolean
    journey: Journey
  }
> = ({ admin, journey }) => (
  <FlagsProvider flags={{ editableStepFooter: true }}>
    <JourneyProvider value={{ admin, journey }}>
      <Stack direction="row">
        <HostAvatars hasPlaceholder={admin} />
      </Stack>
    </JourneyProvider>
  </FlagsProvider>
)

export const Default = Template.bind({})
Default.args = { admin: false, journey }

export const Empty = Template.bind({})
Empty.args = {
  admin: true,
  journey: { ...journey, host: { ...hostData, src1: null } }
}

export const WithPlaceholder = Template.bind({})
WithPlaceholder.args = {
  ...Empty.args,
  journey
}

export const TwoAvatars = Template.bind({})
TwoAvatars.args = {
  ...Empty.args,
  journey: {
    ...journey,
    host: { ...hostData, src2: 'https://tinyurl.com/2nxtwn8v' }
  }
}

export default HostAvatarsDemo as Meta
