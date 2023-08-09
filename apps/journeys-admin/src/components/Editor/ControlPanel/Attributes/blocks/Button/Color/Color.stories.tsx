import { MockedProvider } from '@apollo/client/testing'
import { Meta, Story } from '@storybook/react'

import { simpleComponentConfig } from '../../../../../../../libs/storybook'

import { Color } from '.'

const ColorStory = {
  ...simpleComponentConfig,
  component: Color,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Button/Color'
}

export const Default: Story = () => {
  return (
    <MockedProvider>
      <Color />
    </MockedProvider>
  )
}

export default ColorStory as Meta
