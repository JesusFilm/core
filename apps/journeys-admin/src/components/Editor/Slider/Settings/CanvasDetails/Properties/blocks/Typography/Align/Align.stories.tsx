import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'

import { simpleComponentConfig } from '../../../../../../../../../libs/storybook'

import { Align } from '.'

const AlignStory: Meta<typeof Align> = {
  ...simpleComponentConfig,
  component: Align,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/Properties/blocks/Typography/Align'
}

export const Default: StoryObj<typeof Align> = {
  render: () => {
    return (
      <MockedProvider>
        <Align />
      </MockedProvider>
    )
  }
}

export default AlignStory
