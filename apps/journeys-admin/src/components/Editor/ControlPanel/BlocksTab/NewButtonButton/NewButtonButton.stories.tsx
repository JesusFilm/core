import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider } from '@core/journeys/ui'
import { Story, Meta } from '@storybook/react'
import { simpleComponentConfig } from '../../../../../libs/storybook'
import { JourneyProvider } from '../../../../../libs/context'
import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import { NewButtonButton } from '.'

const NewButtonButtonStory = {
  ...simpleComponentConfig,
  component: NewButtonButton,
  title: 'Journeys-Admin/Editor/ControlPanel/BlocksTab/NewImageButton'
}

export const Default: Story = () => {
  return (
    <MockedProvider mocks={[]}>
      <JourneyProvider value={{ id: 'journeyId' } as unknown as Journey}>
        <EditorProvider
          initialState={{
            selectedStep: {
              __typename: 'StepBlock',
              id: 'stepId',
              parentBlockId: null,
              parentOrder: 0,
              locked: true,
              nextBlockId: null,
              children: [
                {
                  id: 'cardId',
                  __typename: 'CardBlock',
                  parentBlockId: 'stepId',
                  parentOrder: 0,
                  coverBlockId: null,
                  backgroundColor: null,
                  themeMode: null,
                  themeName: null,
                  fullscreen: false,
                  children: []
                }
              ]
            }
          }}
        >
          <NewButtonButton />
        </EditorProvider>
      </JourneyProvider>
    </MockedProvider>
  )
}

export default NewButtonButtonStory as Meta
