import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/nextjs'

import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { Size } from '.'

const SizeStory: Meta<typeof Size> = {
  ...simpleComponentConfig,
  component: Size,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/Properties/blocks/Button/Size'
}

export const Default: StoryObj<typeof Size> = {
  render: () => {
    return (
      <MockedProvider>
        <Size />
      </MockedProvider>
    )
  }
}

export default SizeStory
