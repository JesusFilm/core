import { Story, Meta } from '@storybook/react'
import { simpleComponentConfig } from '../../../../../../../libs/storybook'
import { TextAlign } from '.'

const TextAlignStory = {
  ...simpleComponentConfig,
  component: TextAlign,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Typography/TextAlign'
}

export const Default: Story = () => {
  return <TextAlign id={'text-color-id'} align={null} />
}

export default TextAlignStory as Meta
