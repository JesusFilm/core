import { MockedProvider } from '@apollo/client/testing'
import { Meta, Story } from '@storybook/react'

import { simpleComponentConfig } from '../../../../../../../libs/storybook'

import { Size } from '.'

const SizeStory = {
  ...simpleComponentConfig,
  component: Size,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Button/Size'
}

export const Default: Story = () => {
  return (
    <MockedProvider>
      <Size />
    </MockedProvider>
  )
}

export default SizeStory as Meta
