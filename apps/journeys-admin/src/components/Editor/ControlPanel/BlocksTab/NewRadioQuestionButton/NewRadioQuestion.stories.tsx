import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider } from '@core/journeys/ui'
import { JourneyProvider } from '../../../../../libs/context'
import { simpleComponentConfig } from '../../../../../libs/storybook'
import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import { RADIO_QUESTION_BLOCK_CREATE } from './NewRadioQuestionButton'
import { NewRadioQuestionButton } from '.'

const NewRadioQuestionButtonStory = {
  ...simpleComponentConfig,
  component: NewRadioQuestionButton,
  title: 'Journeys-Admin/Editor/ControlPanel/BlocksTab/NewRadioQuestionButton'
}

export const Default: Story = () => {
  return (
    <MockedProvider
      mocks={[
        {
          request: {
            query: RADIO_QUESTION_BLOCK_CREATE,
            variables: {
              input: {
                journeyId: 'journeyId',
                id: 'uuid',
                parentBlockId: 'cardId',
                label: 'Your Question Here?'
              },
              radioOptionBlockCreateInput1: {
                journeyId: 'journeyId',
                parentBlockId: 'uuid',
                label: 'Option 1'
              },
              radioOptionBlockCreateInput2: {
                journeyId: 'journeyId',
                parentBlockId: 'uuid',
                label: 'Option 2'
              }
            }
          },
          result: {
            data: {
              radioQuestionBlockCreate: {
                __typename: 'RadioQuestionBlock',
                id: 'uuid',
                parentBlockId: 'cardId',
                journeyId: 'journeyId',
                label: 'Your Question Here?',
                description: null
              },
              radioOption1: {
                __typename: 'RadioOptionBlock',
                id: 'radioOptionBlockId1',
                parentBlockId: 'uuid',
                journeyId: 'journeyId',
                label: 'Option 1',
                action: {
                  __typename: 'NavigateToBlockAction',
                  gtmEventName: 'gtmEventName',
                  blockId: 'def'
                }
              },
              radioOption2: {
                __typename: 'RadioOptionBlock',
                id: 'radioOptionBlockId2',
                parentBlockId: 'uuid',
                journeyId: 'journeyId',
                label: 'Option 2',
                action: {
                  __typename: 'NavigateToBlockAction',
                  gtmEventName: 'gtmEventName',
                  blockId: 'def'
                }
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
          <NewRadioQuestionButton />
        </EditorProvider>
      </JourneyProvider>
    </MockedProvider>
  )
}

export default NewRadioQuestionButtonStory as Meta
