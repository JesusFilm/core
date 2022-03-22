import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider } from '@core/journeys/ui'
import { JourneyProvider } from '../../../../../libs/context'
import { simpleComponentConfig } from '../../../../../libs/storybook'
import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import { VIDEO_BLOCK_CREATE } from './NewVideoButton'
import { NewVideoButton } from '.'

const NewVideoButtonStory = {
  ...simpleComponentConfig,
  component: NewVideoButton,
  title: 'Journeys-Admin/Editor/ControlPanel/BlocksTab/NewVideoButton'
}

export const Default: Story = () => {
  return (
    <MockedProvider
      mocks={[
        {
          request: {
            query: VIDEO_BLOCK_CREATE,
            variables: {
              input: {
                journeyId: 'journeyId',
                parentBlockId: 'cardId',
                autoplay: true,
                muted: false
              }
            }
          },
          result: {
            data: {
              videoBlockCreate: {
                id: 'videoBlockId',
                parentBlockId: 'cardId',
                journeyId: 'journeyId',
                muted: false,
                autoplay: true,
                startAt: null,
                endAt: null,
                posterBlockId: null,
                video: null
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
          <NewVideoButton />
        </EditorProvider>
      </JourneyProvider>
    </MockedProvider>
  )
}

export default NewVideoButtonStory as Meta
