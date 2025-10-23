import { MockedProvider } from '@apollo/client/testing/react'
import { Meta, StoryObj } from '@storybook/react'

import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { Color } from '.'

const ColorStory: Meta<typeof Color> = {
  ...simpleComponentConfig,
  component: Color,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/Properties/blocks/Button/Color'
}

export const Default: StoryObj<typeof Color> = {
  render: () => {
    return (
      <MockedProvider>
        <Color />
      </MockedProvider>
    )
  }
}

export default ColorStory
