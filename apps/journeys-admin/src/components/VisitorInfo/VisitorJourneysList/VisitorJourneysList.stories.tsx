import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/nextjs'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { getJourneysMock } from './utils/data'

import { VisitorJourneysList } from '.'

const JourneyListStory: Meta<typeof VisitorJourneysList> = {
  ...journeysAdminConfig,
  title: 'Journeys-Admin/VisitorInfo/VisitorJourneysList',
  component: VisitorJourneysList
}

const Template: StoryObj<typeof VisitorJourneysList> = {
  render: ({ ...args }) => (
    <MockedProvider mocks={[getJourneysMock]}>
      <VisitorJourneysList {...args} />
    </MockedProvider>
  )
}
export const Default = {
  ...Template,
  args: {
    id: 'visitorId'
  }
}

export default JourneyListStory
