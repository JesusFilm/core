import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'

import { simpleComponentConfig } from '../../../../../../../libs/storybook'

import { Size } from '.'

const SizeStory: Meta<typeof Size> = {
  ...simpleComponentConfig,
  component: Size,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Button/Size'
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
