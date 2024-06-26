import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'

import { simpleComponentConfig } from '../../../../../../../../../libs/storybook'

import { Variant } from '.'

const VariantStory: Meta<typeof Variant> = {
  ...simpleComponentConfig,
  component: Variant,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/Properties/blocks/Button/Variant'
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
