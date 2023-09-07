import { MockedProvider } from '@apollo/client/testing'
import { expect } from '@storybook/jest'
import { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent, waitFor } from '@storybook/testing-library'

import { journeysAdminConfig } from '../../../libs/storybook'

import { AddUserSection } from '.'

const AddUsersSectionStory: Meta<typeof AddUserSection> = {
  ...journeysAdminConfig,
  component: AddUserSection,
  title: 'Journeys-Admin/AccessDialog/AddUserSection',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: StoryObj<typeof AddUserSection> = {
  render: () => {
    return (
      <MockedProvider>
        <AddUserSection users={[]} journeyId="journeyId" />
      </MockedProvider>
    )
  }
}

export const Email = { ...Template }

export const Link = {
  ...Template,
  play: async () => {
    await userEvent.click(screen.getByRole('button', { name: 'Email' }))
    await waitFor(async () => {
      await expect(
        screen.getByRole('menuitem', { name: 'Link' })
      ).toBeInTheDocument()
    })
    await userEvent.click(screen.getByRole('menuitem', { name: 'Link' }))
  }
}

export default AddUsersSectionStory
