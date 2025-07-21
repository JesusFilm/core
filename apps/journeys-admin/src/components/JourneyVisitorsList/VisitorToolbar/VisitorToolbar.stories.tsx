import { Meta, StoryObj } from '@storybook/nextjs'
import { ReactElement, useState } from 'react'

import FilterIcon from '@core/shared/ui/icons/Filter'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { VisitorToolbar } from './VisitorToolbar'

const VisitorToolbarStory: Meta<typeof VisitorToolbar> = {
  ...journeysAdminConfig,
  component: VisitorToolbar,
  title: 'Journeys-Admin/JourneyVisitorsList/FilterDrawer/VisitorToolBar',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const VisitorToolBarComponent = (): ReactElement => {
  const [open, setOpen] = useState(false)
  return <FilterIcon onClick={() => setOpen(!open)} />
}

const Template: StoryObj<typeof VisitorToolbar> = {
  render: () => <VisitorToolBarComponent />
}

export const MobileView = { ...Template }

export default VisitorToolbarStory
