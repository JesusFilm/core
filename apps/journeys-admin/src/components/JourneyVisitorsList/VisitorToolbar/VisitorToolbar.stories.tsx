import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded'
import { Meta, StoryObj } from '@storybook/react'
import { ReactElement, useState } from 'react'

import { journeysAdminConfig } from '../../../libs/storybook'

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
  return <FilterListRoundedIcon onClick={() => setOpen(!open)} />
}

const Template: StoryObj<typeof VisitorToolbar> = {
  render: () => <VisitorToolBarComponent />
}

export const MobileView = { ...Template }

export default VisitorToolbarStory
