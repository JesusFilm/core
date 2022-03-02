import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../../libs/storybook'
import { EditToolbar } from '.'

const EditToolbarStory = {
  ...journeysAdminConfig,
  component: EditToolbar,
  title: 'Journeys-Admin/Editor/EditToolbar'
}

const Template: Story = ({ ...args }) => (
  <MockedProvider mocks={[]}>
    <EditToolbar {...args} />
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  forceOpen: true
}

export default EditToolbarStory as Meta
