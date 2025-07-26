import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/nextjs'

import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { Variant } from '.'

const VariantStory: Meta<typeof Variant> = {
  ...simpleComponentConfig,
  component: Variant,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/Properties/blocks/Typography/Variant'
}

export const Default: StoryObj<typeof Variant> = {
  render: () => {
    return (
      <MockedProvider>
        <Variant />
      </MockedProvider>
    )
  }
}

export default VariantStory
