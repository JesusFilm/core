import { Story, Meta } from '@storybook/react'
import { simpleComponentConfig } from '../../../../../../../libs/storybook'
import { TextColor } from '.'

const TextColorStory = {
  ...simpleComponentConfig,
  component: TextColor,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Typography/TextColor'
}

export const Default: Story = () => {
  return <TextColor id={'text-color-id'} color={null} />
}

export default TextColorStory as Meta
