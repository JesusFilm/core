import { Story, Meta } from '@storybook/react'
import { simpleComponentConfig } from '../../../../../../../libs/storybook'
import { Color } from '.'

const ColorStory = {
  ...simpleComponentConfig,
  component: Color,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Button/Color'
}

export const Default: Story = () => {
  return <Color id={'button-color-id'} color={null} />
}

export default ColorStory as Meta
