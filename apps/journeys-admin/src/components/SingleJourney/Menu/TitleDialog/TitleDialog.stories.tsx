import { Story, Meta } from '@storybook/react'
import { useState } from 'react'
import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../../../libs/storybook'
import { TitleDialog, JOURNEY_TITLE_UPDATE } from './TitleDialog'
import { defaultJourney } from '../../singleJourneyData'

const TitleDialogStory = {
  ...journeysAdminConfig,
  component: TitleDialog,
  title: 'Journeys-Admin/SingleJourney/Menu/TitleDialog'
}

const Template: Story = () => {
  const [open, setOpen] = useState(true)

  return (
    <MockedProvider
      mocks={[
        {
          request: {
            query: JOURNEY_TITLE_UPDATE,
            variables: {
              input: {
                id: defaultJourney.id,
                title: 'New Journey'
              }
            }
          },
          result: {
            data: {
              journeyUpdate: {
                id: defaultJourney.id,
                __typename: 'Journey',
                title: 'New Journey'
              }
            }
          }
        }
      ]}
    >
      <TitleDialog open={open} onClose={() => setOpen(false)} />
    </MockedProvider>
  )
}

export const Title = Template.bind({})

export default TitleDialogStory as Meta
