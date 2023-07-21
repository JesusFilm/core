import { MockedProvider } from '@apollo/client/testing'
import { Story, Meta } from '@storybook/react'
import { screen, userEvent, waitFor } from '@storybook/testing-library'
import { journeysAdminConfig } from '../../../libs/storybook'
import { AddUserSection } from '.'

const AddUsersSectionStory = {
  ...journeysAdminConfig,
  component: AddUserSection,
  title: 'Journeys-Admin/AccessDialog/AddUserSection',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: Story = () => {
  return (
    <MockedProvider>
      <AddUserSection users={[]} journeyId="journeyId" />
    </MockedProvider>
  )
}

export const Email = Template.bind({})

export const Link = Template.bind({})
Link.play = async () => {
  await waitFor(() => {
    userEvent.click(screen.getByRole('button', { name: 'Email' }))
    userEvent.click(screen.getByRole('menuitem', { name: 'Link' }))
  })
}

export default AddUsersSectionStory as Meta
