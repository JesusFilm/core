import { MockedProvider } from '@apollo/client/testing'
import { Meta, Story } from '@storybook/react'
import { userEvent, waitFor, within } from '@storybook/testing-library'

import {
  GetAdminJourneys_journeys as Journey,
  GetAdminJourneys_journeys_userJourneys as UserJourney
} from '../../../../__generated__/GetAdminJourneys'
import { UserJourneyRole } from '../../../../__generated__/globalTypes'
import { journeysAdminConfig } from '../../../libs/storybook'
import { TeamProvider } from '../../Team/TeamProvider'
import {
  archiveddJourney,
  defaultJourney,
  descriptiveJourney,
  oldJourney,
  publishedJourney,
  trashedJourney
} from '../journeyListData'

import { JourneyCard } from './JourneyCard'
import { JourneyCardVariant } from './journeyCardVariant'

const TestStory = {
  ...journeysAdminConfig,
  component: JourneyCard,
  title: 'Journeys-Admin/JourneyList/JourneyCard'
}

const Template: Story = ({ ...args }) => (
  <MockedProvider>
    <TeamProvider>
      <JourneyCard {...args} />
    </TeamProvider>
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  journey: defaultJourney
}

export const Published = Template.bind({})
Published.args = {
  journey: publishedJourney
}

export const Archived = Template.bind({})
Archived.args = {
  journey: archiveddJourney
}

export const Trashed = Template.bind({})
Trashed.args = {
  journey: trashedJourney
}

export const ExcessContent = Template.bind({})
ExcessContent.args = {
  journey: descriptiveJourney
}

export const PreYear = Template.bind({})
PreYear.args = {
  journey: oldJourney
}

export const Loading = Template.bind({})
Loading.args = {
  journey: undefined
}

export const New = Template.bind({})
New.args = {
  journey: defaultJourney,
  variant: JourneyCardVariant.new
}
New.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement)
  await waitFor(async () => {
    await userEvent.hover(canvas.getByTestId('CircleRoundedIcon'))
  })
}

export const ActionRequired = Template.bind({})
const uj = defaultJourney.userJourneys as unknown as UserJourney[]
const actionRequiredJourney = {
  ...defaultJourney,
  userJourneys: [
    ...uj,
    {
      __typename: 'UserJourney',
      id: 'userJourney4.id',
      role: UserJourneyRole.inviteRequested,
      user: {
        __typename: 'User',
        id: 'user4.id',
        firstName: 'Four',
        lastName: 'LastName',
        imageUrl: null
      }
    },
    {
      __typename: 'UserJourney',
      id: 'userJourney5.id',
      role: UserJourneyRole.inviteRequested,
      user: {
        __typename: 'User',
        id: 'user5.id',
        firstName: 'Five',
        lastName: 'LastName',
        imageUrl: null
      }
    }
  ]
} as unknown as Journey
ActionRequired.args = {
  journey: actionRequiredJourney,
  variant: JourneyCardVariant.actionRequired
}

export default TestStory as Meta
