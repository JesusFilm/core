import { Meta, StoryObj } from '@storybook/react'
import { HelpButton } from './HelpButton'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

const HelpButtonStory: Meta<typeof HelpButton> = {
  ...simpleComponentConfig,
  component: HelpButton,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/JourneyAppearance/Chat/HelpButton'
}

const Template: StoryObj<typeof HelpButton> = {
  render: () => <HelpButton />
}

export const Default = {
  ...Template
}

export default HelpButtonStory
