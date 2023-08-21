import { MockedProvider } from '@apollo/client/testing'
import { expect } from '@storybook/jest'
import { Meta, Story } from '@storybook/react'
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
  await userEvent.click(screen.getByRole('button', { name: 'Email' }))
  await waitFor(async () => {
    await expect(
      screen.getByRole('menuitem', { name: 'Link' })
    ).toBeInTheDocument()
  })
  await userEvent.click(screen.getByRole('menuitem', { name: 'Link' }))
}

export default AddUsersSectionStory as Meta
