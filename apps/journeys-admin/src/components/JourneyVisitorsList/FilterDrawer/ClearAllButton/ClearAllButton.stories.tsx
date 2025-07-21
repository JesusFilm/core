import { Meta, StoryObj } from '@storybook/nextjs'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

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
