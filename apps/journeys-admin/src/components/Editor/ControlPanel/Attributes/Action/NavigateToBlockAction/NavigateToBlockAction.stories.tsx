import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider } from '@core/journeys/ui'
import { simpleComponentConfig } from '../../../../../../libs/storybook'
import { GetJourney_journey as Journey } from '../../../../../../../__generated__/GetJourney'
import {
  ThemeName,
  ThemeMode
} from '../../../../../../../__generated__/globalTypes'
import { JourneyProvider } from '../../../../../../libs/context'
import { steps } from '../data'
import { NavigateToBlockAction } from '.'

const NavigateToBlockActionStory = {
  ...simpleComponentConfig,
  component: NavigateToBlockAction,
  title:
    'Journeys-Admin/Editor/ControlPanel/Attributes/ActionProperties/NavigateToBlockAction'
}

const journeyTheme = {
  id: 'journeyId',
  themeMode: ThemeMode.light,
  themeName: ThemeName.base
} as unknown as Journey

export const Default: Story = () => {
  return (
    <MockedProvider>
      <JourneyProvider value={journeyTheme}>
        <EditorProvider initialState={{ steps }}>
          <NavigateToBlockAction />
        </EditorProvider>
      </JourneyProvider>
    </MockedProvider>
  )
}

export const SelectedCard: Story = () => {
  const selectedBlock = steps[4].children[0].children[4]

  return (
    <MockedProvider>
      <JourneyProvider value={journeyTheme}>
        <EditorProvider initialState={{ selectedBlock, steps }}>
          <NavigateToBlockAction />
        </EditorProvider>
      </JourneyProvider>
    </MockedProvider>
  )
}

export default NavigateToBlockActionStory as Meta
