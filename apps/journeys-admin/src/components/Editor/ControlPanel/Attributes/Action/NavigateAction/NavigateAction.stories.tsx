import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider } from '@core/journeys/ui'
import { simpleComponentConfig } from '../../../../../../libs/storybook'
import {
  ThemeName,
  ThemeMode
} from '../../../../../../../__generated__/globalTypes'
import { JourneyProvider } from '../../../../../../libs/context'
import { GetJourney_journey as Journey } from '../../../../../../../__generated__/GetJourney'
import { steps } from '../data'
import { NavigateAction } from '.'

const NavigateNextStory = {
  ...simpleComponentConfig,
  component: NavigateAction,
  title:
    'Journeys-Admin/Editor/ControlPanel/Attributes/ActionProperties/NavigateAction'
}

const journeyTheme = {
  id: 'journeyId',
  themeMode: ThemeMode.light,
  themeName: ThemeName.base
} as unknown as Journey

export const Default: Story = () => {
  const selectedStep = steps[3]

  return (
    <MockedProvider>
      <JourneyProvider value={journeyTheme}>
        <EditorProvider
          initialState={{
            steps,
            selectedStep
          }}
        >
          <NavigateAction />
        </EditorProvider>
      </JourneyProvider>
    </MockedProvider>
  )
}

export const End: Story = () => {
  const selectedStep = steps[4]

  return (
    <MockedProvider>
      <JourneyProvider value={journeyTheme}>
        <EditorProvider
          initialState={{
            steps,
            selectedStep
          }}
        >
          <NavigateAction />
        </EditorProvider>
      </JourneyProvider>
    </MockedProvider>
  )
}

export default NavigateNextStory as Meta
