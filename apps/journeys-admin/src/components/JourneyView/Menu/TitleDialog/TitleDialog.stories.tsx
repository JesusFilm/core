import { Story, Meta } from '@storybook/react'
import { useState } from 'react'
import { MockedProvider } from '@apollo/client/testing'
import { screen, userEvent } from '@storybook/testing-library'
import { journeysAdminConfig } from '../../../../libs/storybook'
import { JourneyProvider } from '../../../../libs/context'
import { defaultJourney } from '../../data'
import { TitleDialog, JOURNEY_TITLE_UPDATE } from './TitleDialog'

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

export const Default = Template.bind({})
export const Error = Template.bind({})
Error.play = () => {
  const button = screen.getByRole('button', { name: 'Save' })
  userEvent.click(button)
}

export default TitleDialogStory as Meta
