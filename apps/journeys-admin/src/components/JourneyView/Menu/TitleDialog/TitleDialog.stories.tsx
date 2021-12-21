import { Story, Meta } from '@storybook/react'
import { useState } from 'react'
import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../../../libs/storybook'
import { TitleDialog, JOURNEY_TITLE_UPDATE } from './TitleDialog'
import { JourneyProvider } from '../../Context'
import { defaultJourney } from '../../data'

const TitleDialogStory = {
  ...journeysAdminConfig,
  component: TitleDialog,
  title: 'Journeys-Admin/JourneyView/Menu/TitleDialog'
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
      <JourneyProvider value={defaultJourney}>
        <TitleDialog open={open} onClose={() => setOpen(false)} />
      </JourneyProvider>
    </MockedProvider>
  )
}

export const Title = Template.bind({})

export default TitleDialogStory as Meta
