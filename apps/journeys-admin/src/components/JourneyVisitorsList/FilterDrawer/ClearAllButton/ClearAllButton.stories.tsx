import { Meta, Story } from '@storybook/react'
import { ComponentProps } from 'react'

import { journeysAdminConfig } from '../../../../libs/storybook'

import { ClearAllButton } from './ClearAllButton'

const ClearAllButtonStory = {
  ...journeysAdminConfig,
  component: ClearAllButton,
  title: 'Journeys-Admin/JourneyVisitorsList/FilterDrawer/ClearAllButton',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: Story<ComponentProps<typeof ClearAllButton>> = () => (
  <ClearAllButton />
)

export const Default = Template.bind({})

export default ClearAllButtonStory as Meta
