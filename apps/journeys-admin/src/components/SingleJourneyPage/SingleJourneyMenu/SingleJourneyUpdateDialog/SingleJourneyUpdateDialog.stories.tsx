import { Story, Meta } from '@storybook/react'
import { useState } from 'react'
import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../../../libs/storybook'
import { defaultJourney } from '../../../JourneyList/journeyListData'
import SingleJourneyUpdateDialog from './SingleJourneyUpdateDialog'
import { JOURNEY_UPDATE, UpdateJourneyFields } from '../SingleJourneyMenu'
import { JourneyStatus } from '../../../../../__generated__/globalTypes'

const TestStory = {
  ...journeysAdminConfig,
  component: SingleJourneyUpdateDialog,
  title: 'Journeys-Admin/SingleJourneyPage/SingleJourneyUpdateDialog'
}

const Template: Story = () => {
  const [open, setOpen] = useState(true)

  return (
    <MockedProvider
      mocks={[
        {
          request: {
            query: JOURNEY_UPDATE,
            variables: {
              input: {
                id: defaultJourney.id,
                title: 'New Journey',
                description: 'Description',
                status: JourneyStatus.published
              }
            }
          },
          result: {
            data: {
              journeyUpdate: {
                id: defaultJourney.id,
                __typename: 'Journey',
                title: 'New Journey',
                description: 'Description',
                status: JourneyStatus.published
              }
            }
          }
        }
      ]}
    >
      <SingleJourneyUpdateDialog
        field={UpdateJourneyFields.TITLE}
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={() => {}}
        journey={{ ...defaultJourney }}
      />
    </MockedProvider>
  )
}

export const Title = Template.bind({})

const DescriptionTemplate: Story = () => {
  const [open, setOpen] = useState(true)

  return (
    <MockedProvider
      mocks={[
        {
          request: {
            query: JOURNEY_UPDATE,
            variables: {
              input: {
                id: defaultJourney.id,
                title: 'Journey',
                description: 'New Description',
                status: JourneyStatus.published
              }
            }
          },
          result: {
            data: {
              journeyUpdate: {
                id: defaultJourney.id,
                __typename: 'Journey',
                title: 'Journey',
                description: 'New Description',
                status: JourneyStatus.published
              }
            }
          }
        }
      ]}
    >
      <SingleJourneyUpdateDialog
        field={UpdateJourneyFields.DESCRIPTION}
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={() => {}}
        journey={{ ...defaultJourney }}
      />
    </MockedProvider>
  )
}

export const Description = DescriptionTemplate.bind({})

export default TestStory as Meta
