import { MockedProvider } from '@apollo/client/testing'
import { Story, Meta } from '@storybook/react'
import { simpleComponentConfig } from '../../../../../libs/storybook'
import { NewTextResponseButton } from './NewTextResponseButton'

const NewTextResponseButtonStory = {
  ...simpleComponentConfig,
  component: NewTextResponseButton,
  title: 'Journeys-Admin/Editor/ControlPanel/BlocksTab/NewTextResponseButton'
}

export const Default: Story = () => {
  return (
    <MockedProvider>
      <NewTextResponseButton />
    </MockedProvider>
  )
}

export default NewTextResponseButtonStory as Meta
