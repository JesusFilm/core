import { Meta, StoryObj } from '@storybook/nextjs'
import { ReactElement, useState } from 'react'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { JourneySort, SortOrder } from '.'

const JourneySortMock = ({ ...args }): ReactElement => {
  const [sortOrder, setSortOrder] = useState<SortOrder>()
  return (
    <JourneySort sortOrder={sortOrder} onChange={setSortOrder} open {...args} />
  )
}

const JourneySortDemo: Meta<typeof JourneySort> = {
  ...journeysAdminConfig,
  component: JourneySort,
  title: 'Journeys-Admin/JourneyList/JourneySort'
}

const Template: StoryObj<typeof JourneySort> = {
  render: (args) => <JourneySortMock {...args} />
}
export const Default = { ...Template }

export const Disabled = {
  ...Template,
  args: {
    open: false,
    disabled: true
  }
}

export default JourneySortDemo
