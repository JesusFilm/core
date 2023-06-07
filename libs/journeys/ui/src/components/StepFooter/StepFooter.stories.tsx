import { ComponentProps } from 'react'
import { Story, Meta } from '@storybook/react'
import Stack from '@mui/material/Stack'
import { journeyUiConfig } from '../../libs/journeyUiConfig'

import {
  ThemeMode,
  ThemeName,
  JourneyStatus
} from '../../../__generated__/globalTypes'

import { JourneyProvider } from '../../libs/JourneyProvider'
import { JourneyFields as Journey } from '../../libs/JourneyProvider/__generated__/JourneyFields'
import { StepFooter } from './StepFooter'

const Demo = {
  ...journeyUiConfig,
  component: StepFooter,
  title: 'Journeys-Ui/StepFooter',
  parameters: {
    ...journeyUiConfig.parameters,
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
  seoTitle: null,
  seoDescription: null
}

const Template: Story<ComponentProps<typeof StepFooter>> = () => {
  return (
    <JourneyProvider value={{ journey }}>
      <Stack
        sx={{
          position: 'relative',
          width: '100%',
          height: 64,
          border: '1px solid black',
          justifyContent: 'center'
        }}
      >
        <StepFooter />
      </Stack>
    </JourneyProvider>
  )
}

// StepFooter exists only on dark mode on desktop view
export const Default = Template.bind({})

export const RTL = Template.bind({})
RTL.args = { ...Default.args }
RTL.parameters = { rtl: true }

export default Demo as Meta
