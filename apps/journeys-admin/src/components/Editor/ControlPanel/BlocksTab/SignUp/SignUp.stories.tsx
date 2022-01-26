import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider } from '@core/journeys/ui'
import { JourneyProvider } from '../../../../../libs/context'
import { journeysAdminConfig } from '../../../../../libs/storybook'
import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import { SIGN_UP_BLOCK_CREATE } from './SignUp'
import { SignUp } from '.'

const SignUpStory = {
  ...journeysAdminConfig,
  component: SignUp,
  title: 'Journeys-Admin/Editor/ControlPanel/BlocksTab/SignUp'
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
                id: 'typographyBlockId',
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
              locked: true,
              nextBlockId: null,
              children: [
                {
                  id: 'cardId',
                  __typename: 'CardBlock',
                  parentBlockId: 'stepId',
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
          <SignUp />
        </EditorProvider>
      </JourneyProvider>
    </MockedProvider>
  )
}

export default SignUpStory as Meta
