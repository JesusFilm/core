import { Story, Meta } from '@storybook/react'
import { simpleComponentConfig } from '../../../../../../../libs/storybook'
import { Size } from '.'

const SizeStory = {
  ...simpleComponentConfig,
  component: Size,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Button/Size'
}

export const Default: Story = () => {
  return <Size id={'button-Size-id'} size={null} />
}

export default SizeStory as Meta
