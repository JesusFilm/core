import { Story, Meta } from '@storybook/react'
import { simpleComponentConfig } from '../../../../../../../libs/storybook'
import { Color } from '.'

const ColorStory = {
  ...simpleComponentConfig,
  component: Color,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Typography/Color'
}

export const Default: Story = () => {
  return <Color id={'text-color-id'} color={null} />
}

export default ColorStory as Meta
