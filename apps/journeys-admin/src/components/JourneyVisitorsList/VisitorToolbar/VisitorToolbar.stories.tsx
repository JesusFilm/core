import { Meta, Story } from '@storybook/react'
import { useState, ComponentProps } from 'react'

import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded'
import { journeysAdminConfig } from '../../../libs/storybook'
import { VisitorToolbar } from './VisitorToolbar'

const VisitorToolbarStory = {
  ...journeysAdminConfig,
  component: VisitorToolbar,
  title: 'Journeys-Admin/JourneyVisitorsList/FilterDrawer/VisitorToolBar',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: Story<ComponentProps<typeof VisitorToolbar>> = (args) => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <FilterListRoundedIcon onClick={() => setOpen(!open)} />
    </>
  )
}

export const MobileView = Template.bind({})

export default VisitorToolbarStory as Meta
