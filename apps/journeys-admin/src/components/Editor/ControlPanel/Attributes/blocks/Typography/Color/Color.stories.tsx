import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { simpleComponentConfig } from '../../../../../../../libs/storybook'
import { Color } from '.'

const ColorStory = {
  ...simpleComponentConfig,
  component: Color,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Typography/Color'
}

export const Default: Story = () => {
  return (
    <MockedProvider>
      <Color />
    </MockedProvider>
  )
}

export default ColorStory as Meta
