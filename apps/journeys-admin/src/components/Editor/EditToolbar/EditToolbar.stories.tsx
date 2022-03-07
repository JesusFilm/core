import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { simpleComponentConfig } from '../../../libs/storybook'
import { EditToolbar } from '.'

const EditToolbarStory = {
  ...simpleComponentConfig,
  component: EditToolbar,
  title: 'Journeys-Admin/Editor/EditToolbar'
}

export const Default: Story = () => {
  return (
    <MockedProvider>
      <EditToolbar />
    </MockedProvider>
  )
}

export default EditToolbarStory as Meta
