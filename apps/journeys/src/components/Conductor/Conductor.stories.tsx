import { ComponentProps } from 'react'
import { MockedProvider } from '@apollo/client/testing'
import { Story, Meta } from '@storybook/react'
import { screen, userEvent, waitFor } from '@storybook/testing-library'
import { expect } from '@storybook/jest'
import { SnackbarProvider } from 'notistack'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import {
  JourneyFields as Journey,
  JourneyFields_language as Language
} from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'
import { STEP_VIEW_EVENT_CREATE } from '@core/journeys/ui/Step/Step'
import { journeysConfig } from '../../libs/storybook'
import {
  ThemeName,
  ThemeMode,
  JourneyStatus
} from '../../../__generated__/globalTypes'
import {
  basic,
  imageBlocks,
  videoBlocks,
  videoLoop
} from '../../libs/testData/storyData'
import { JOURNEY_VIEW_EVENT_CREATE } from './Conductor'
import { Conductor } from '.'

const Demo = {
  ...journeysConfig,
  component: Conductor,
  title: 'Journeys/Conductor',
  parameters: {
    ...journeysConfig.parameters,
    layout: 'fullscreen'
  }
}

const rtlLanguage: Language = {
  __typename: 'Language',
  id: '529',
  bcp47: 'ar',
  iso3: 'arb',
  name: [
    {
      __typename: 'Translation',
      value: 'Arabic',
      primary: false
    }
  ]
}

const defaultJourney: Journey = {
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

const Template: Story<
  ComponentProps<typeof Conductor> & { journey?: Journey }
> = ({ journey = defaultJourney, ...args }) => (
  <MockedProvider
    mocks={[
      {
        request: {
          query: JOURNEY_VIEW_EVENT_CREATE,
          variables: {
            input: {
              id: 'uuid',
              journeyId: 'journeyId',
              label: 'my journey',
              value: '529'
            }
          }
        },
        result: {
          data: {
            journeyViewEventCreate: {
              id: 'uuid',
              __typename: 'JourneyViewEvent'
            }
          }
        }
      },
      {
        request: {
          query: STEP_VIEW_EVENT_CREATE,
          variables: {
            input: {
              id: 'uuid',
              blockId: 'step0.id',
              value: "What's our purpose, and how did we get here?"
            }
          }
        },
        result: {
          data: {
            stepViewEventCreate: {
              __typename: 'StepViewEvent',
              id: 'uuid'
            }
          }
        }
      }
    ]}
  >
    <JourneyProvider value={{ journey }}>
      <SnackbarProvider>
        <Conductor {...args} uuid={() => 'uuid'} />
      </SnackbarProvider>
    </JourneyProvider>
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  blocks: basic
}

export const WithContent = Template.bind({})
WithContent.args = {
  blocks: imageBlocks
}
WithContent.play = async () => {
  await waitFor(() =>
    expect(screen.getAllByTestId('conductorRightButton')[0]).toBeInTheDocument()
  )
  const nextButton = screen.getAllByTestId('conductorRightButton')[0]
  await waitFor(() => {
    userEvent.click(nextButton)
    expect(screen.getAllByTestId('leftNavContainer')[1]).toBeInTheDocument()
  })
}

export const WithVideo = Template.bind({})
WithVideo.args = {
  blocks: videoBlocks
}

export const WithVideoLoop = Template.bind({})
WithVideoLoop.args = {
  blocks: videoLoop
}

export const RTL = Template.bind({})
RTL.args = {
  journey: { ...defaultJourney, language: rtlLanguage },
  blocks: basic
}
RTL.parameters = {
  rtl: true
}

export default Demo as Meta
