import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'

import { simpleComponentConfig } from '../../../../../../../libs/storybook'

import { Color } from '.'

const ColorStory: Meta<typeof Color> = {
  ...simpleComponentConfig,
  component: Color,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Typography/Color'
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
