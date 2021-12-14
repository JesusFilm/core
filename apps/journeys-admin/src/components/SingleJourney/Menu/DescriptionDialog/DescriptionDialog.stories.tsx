import { Story, Meta } from '@storybook/react'
import { useState } from 'react'
import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../../../libs/storybook'
import { DescriptionDialog, JOURNEY_DESC_UPDATE } from './DescriptionDialog'
import { defaultJourney } from '../../singleJourneyData'

const DescriptionDialogStory = {
  ...journeysAdminConfig,
  component: DescriptionDialog,
  title: 'Journeys-Admin/SingleJourney/Menu/DescriptionDialog'
}

const Template: Story = () => {
  const [open, setOpen] = useState(true)

  return (
    <MockedProvider
      mocks={[
        {
          request: {
            query: JOURNEY_DESC_UPDATE,
            variables: {
              input: {
                id: defaultJourney.id,
                description: 'New Description'
              }
            }
          },
          result: {
            data: {
              journeyUpdate: {
                id: defaultJourney.id,
                __typename: 'Journey',
                description: 'New Description'
              }
            }
          }
        }
      ]}
    >
      <DescriptionDialog open={open} onClose={() => setOpen(false)} />
    </MockedProvider>
  )
}

export const Default = Template.bind({})

export default DescriptionDialogStory as Meta
