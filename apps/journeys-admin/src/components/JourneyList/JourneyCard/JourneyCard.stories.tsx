import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/nextjs'
import { userEvent, waitFor, within } from 'storybook/test'

import { TeamProvider } from '@core/journeys/ui/TeamProvider'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import {
  GetAdminJourneys_journeys as Journey,
  GetAdminJourneys_journeys_userJourneys as UserJourney
} from '../../../../__generated__/GetAdminJourneys'
import { UserJourneyRole } from '../../../../__generated__/globalTypes'
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

import '../../../../test/i18n'

const TestStory: Meta<typeof JourneyCard> = {
  ...journeysAdminConfig,
  component: JourneyCard,
  title: 'Journeys-Admin/JourneyList/JourneyCard'
}

const Template: StoryObj<typeof JourneyCard> = {
  render: ({ ...args }) => (
    <MockedProvider>
      <TeamProvider>
        <JourneyCard {...args} />
      </TeamProvider>
    </MockedProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    journey: defaultJourney
  }
}

export const Published = {
  ...Template,
  args: {
    journey: publishedJourney
  }
}

export const Archived = {
  ...Template,
  args: {
    journey: archiveddJourney
  }
}

export const Trashed = {
  ...Template,
  args: {
    journey: trashedJourney
  }
}

export const ExcessContent = {
  ...Template,
  args: {
    journey: descriptiveJourney
  }
}

export const PreYear = {
  ...Template,
  args: {
    journey: oldJourney
  }
}

export const New = {
  ...Template,
  args: {
    journey: defaultJourney,
    variant: JourneyCardVariant.new
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement)
    await waitFor(async () => {
      await userEvent.hover(canvas.getByTestId('CircleRoundedIcon'))
    })
  }
}

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

export const ActionRequired = {
  ...Template,
  args: {
    journey: actionRequiredJourney,
    variant: JourneyCardVariant.actionRequired
  }
}

export default TestStory
