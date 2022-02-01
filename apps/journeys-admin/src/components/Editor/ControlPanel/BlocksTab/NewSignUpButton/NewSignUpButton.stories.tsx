import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider } from '@core/journeys/ui'
import { JourneyProvider } from '../../../../../libs/context'
import { simpleComponentConfig } from '../../../../../libs/storybook'
import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import { SIGN_UP_BLOCK_CREATE } from './NewSignUpButton'
import { NewSignUpButton } from '.'

const NewSignUpButtonStory = {
  ...simpleComponentConfig,
  component: NewSignUpButton,
  title: 'Journeys-Admin/Editor/ControlPanel/BlocksTab/NewSignUpButton'
}

export const Default: Story = () => {
  return (
    <MockedProvider
      mocks={[
        {
          request: {
            query: SIGN_UP_BLOCK_CREATE,
            variables: {
              input: {
                journeyId: 'journeyId',
                parentBlockId: 'cardId',
                submitLabel: 'Submit'
              }
            }
          },
          result: {
            data: {
              signUpBlockCreate: {
                id: 'signUpBlockId',
                parentBlockId: 'cardId',
                journeyId: 'journeyId',
                submitLabel: 'Submit',
                action: {
                  __typename: 'NavigateToBlockAction',
                  gtmEventName: 'gtmEventName',
                  blockId: 'def'
                },
                submitIcon: null
              }
            }
          }
        }
      ]}
      addTypename={false}
    >
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
                  coverBlockId: null,
                  parentOrder: 0,
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
          <NewSignUpButton />
        </EditorProvider>
      </JourneyProvider>
    </MockedProvider>
  )
}

export default NewSignUpButtonStory as Meta
