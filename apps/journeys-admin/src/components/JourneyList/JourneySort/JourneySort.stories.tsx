import { Story, Meta } from '@storybook/react'
import { ReactElement, useState } from 'react'
import { journeysAdminConfig } from '../../../libs/storybook'
import { JourneySort, SortOrder } from '.'

const JourneySortMock = (): ReactElement => {
  const [sortOrder, setSortOrder] = useState<SortOrder>()
  return (
    <JourneySort sortOrder={sortOrder} onChange={setSortOrder} open={true} />
  )
}

const JourneySortDemo = {
  ...journeysAdminConfig,
  component: JourneySort,
  title: 'Journeys-Admin/JourneyList/JourneySort'
}

const Template: Story = () => <JourneySortMock />

export const Default = Template.bind({})

export default JourneySortDemo as Meta
