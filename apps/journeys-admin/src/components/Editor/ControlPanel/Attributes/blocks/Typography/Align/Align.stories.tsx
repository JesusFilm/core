import { MockedProvider } from '@apollo/client/testing'
import { Meta, Story } from '@storybook/react'

import { simpleComponentConfig } from '../../../../../../../libs/storybook'

import { Align } from '.'

const AlignStory = {
  ...simpleComponentConfig,
  component: Align,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Typography/Align'
}

export const Default: Story = () => {
  return (
    <MockedProvider>
      <Align />
    </MockedProvider>
  )
}

export default AlignStory as Meta
