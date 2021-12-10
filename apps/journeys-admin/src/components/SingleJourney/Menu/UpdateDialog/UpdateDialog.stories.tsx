import { Story, Meta } from '@storybook/react'
import { useState } from 'react'
import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../../../libs/storybook'
import { defaultJourney } from '../../../JourneyList/journeyListData'
import UpdateDialog, { JOURNEY_UPDATE } from './UpdateDialog'
import { UpdateJourneyFields } from '../Menu'

const TestStory = {
  ...journeysAdminConfig,
  component: UpdateDialog,
  title: 'Journeys-Admin/SingleJourney/UpdateDialog'
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
                description: 'Description'
              }
            }
          },
          result: {
            data: {
              journeyUpdate: {
                id: defaultJourney.id,
                __typename: 'Journey',
                title: 'New Journey',
                description: 'Description'
              }
            }
          }
        }
      ]}
    >
      <UpdateDialog
        field={UpdateJourneyFields.TITLE}
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={() => {
          console.log('SUCCESS')
        }}
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
                description: 'New Description'
              }
            }
          },
          result: {
            data: {
              journeyUpdate: {
                id: defaultJourney.id,
                __typename: 'Journey',
                title: 'Journey',
                description: 'New Description'
              }
            }
          }
        }
      ]}
    >
      <UpdateDialog
        field={UpdateJourneyFields.DESCRIPTION}
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={() => {
          console.log('SUCCESS')
        }}
        journey={{ ...defaultJourney }}
      />
    </MockedProvider>
  )
}

export const Description = DescriptionTemplate.bind({})

export default TestStory as Meta
