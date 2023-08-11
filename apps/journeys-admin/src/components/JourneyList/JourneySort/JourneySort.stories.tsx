import { Meta, Story } from '@storybook/react'
import { ReactElement, useState } from 'react'

import { journeysAdminConfig } from '../../../libs/storybook'

import { JourneySort, SortOrder } from '.'

const JourneySortMock = ({ ...args }): ReactElement => {
  const [sortOrder, setSortOrder] = useState<SortOrder>()
  return (
    <JourneySort sortOrder={sortOrder} onChange={setSortOrder} open {...args} />
  )
}

const JourneySortDemo = {
  ...journeysAdminConfig,
  component: JourneySort,
  title: 'Journeys-Admin/JourneyList/JourneySort'
}

const Template: Story = (args) => <JourneySortMock {...args} />

export const Default = Template.bind({})

export const Disabled = Template.bind({})
Disabled.args = {
  open: false,
  disabled: true
}

export default JourneySortDemo as Meta
