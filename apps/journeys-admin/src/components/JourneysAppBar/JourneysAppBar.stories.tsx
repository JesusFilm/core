import { journeysAdminConfig } from '../../libs/storybook'
import { MockedProvider } from '@apollo/client/testing'
import { Meta, Story } from '@storybook/react'
import JourneysAppBar, { JourneysAppBarProps } from '.'
import { JOURNEY_PUBLISH } from '../SingleJourney/Menu'
import { defaultJourney } from '../JourneyList/journeyListData'
import { JourneyStatus } from '../../../__generated__/globalTypes'

const JourneysAppBarDemo = {
  ...journeysAdminConfig,
  component: JourneysAppBar,
  title: 'Journeys-Admin/JourneysAppBar'
}

const Template: Story<JourneysAppBarProps> = ({ ...args }) => (
  <MockedProvider
    mocks={[
      {
        request: {
          query: JOURNEY_PUBLISH,
          variables: {
            input: {
              status: JourneyStatus.published
            }
          }
        },
        result: {
          data: {
            journeyUpdate: {
              __typename: 'Journey',
              status: JourneyStatus.published
            }
          }
        }
      }
    ]}
  >
    <JourneysAppBar {...args} />
  </MockedProvider>
)

export const Default = Template.bind({})

export const SingleJourney = Template.bind({})
SingleJourney.args = { journey: defaultJourney }

export default JourneysAppBarDemo as Meta
