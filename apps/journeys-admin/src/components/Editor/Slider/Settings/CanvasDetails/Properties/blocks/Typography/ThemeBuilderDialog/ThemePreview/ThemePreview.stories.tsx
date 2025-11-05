import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { ThemePreview } from '.'

const ThemePreviewStory: Meta<typeof ThemePreview> = {
  ...simpleComponentConfig,
  component: ThemePreview,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/Properties/blocks/Typography/ThemeBuilderDialog/ThemePreview'
}

const Template: StoryObj<ComponentProps<typeof ThemePreview>> = {
  render: (args) => <ThemePreview {...args} />
}

export const Default = {
  ...Template,
  args: {
    headerFont: 'Arial',
    bodyFont: 'Arial',
    labelFont: 'Arial'
  }
}

export const Mixed = {
  ...Template,
  args: {
    headerFont: 'Georgia',
    bodyFont: 'Verdana',
    labelFont: 'Tahoma'
  }
}

export default ThemePreviewStory
