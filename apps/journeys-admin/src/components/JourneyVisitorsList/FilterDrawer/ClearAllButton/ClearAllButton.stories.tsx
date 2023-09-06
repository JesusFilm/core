import { Meta, StoryObj } from '@storybook/react'

import { journeysAdminConfig } from '../../../../libs/storybook'

import { ClearAllButton } from './ClearAllButton'

const ClearAllButtonStory: Meta<typeof ClearAllButton> = {
  ...journeysAdminConfig,
  component: ClearAllButton,
  title: 'Journeys-Admin/JourneyVisitorsList/FilterDrawer/ClearAllButton',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: StoryObj<typeof ClearAllButton> = {
  render: () => <ClearAllButton />
}

export const Default = { ...Template }

export default ClearAllButtonStory
