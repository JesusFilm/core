import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { simpleComponentConfig } from '../../../../../../../libs/storybook'
import { TextAlign } from '.'

const TextAlignStory = {
  ...simpleComponentConfig,
  component: TextAlign,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Typography/TextAlign'
}

export const Default: Story = () => {
  return (
    <MockedProvider>
      <TextAlign id={'text-color-id'} align={null} />
    </MockedProvider>
  )
}

export default TextAlignStory as Meta
