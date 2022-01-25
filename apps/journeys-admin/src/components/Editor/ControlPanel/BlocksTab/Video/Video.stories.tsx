import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider } from '@core/journeys/ui'
import { JourneyProvider } from '../../../../../libs/context'
import { journeysAdminConfig } from '../../../../../libs/storybook'
import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import { VIDEO_BLOCK_CREATE } from './Video'
import { Video } from '.'

const VideoStory = {
  ...journeysAdminConfig,
  component: Video,
  title: 'Journeys-Admin/Editor/ControlPanel/BlocksTab/Video'
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
                muted: false,
                videoContent: {
                  src: null
                },
                title: ''
              }
            }
          },
          result: {
            data: {
              videoBlockCreate: {
                id: 'videoBlockId',
                parentBlockId: 'cardId',
                journeyId: 'journeyId',
                title: '',
                muted: false,
                autoplay: true,
                startAt: null,
                endAt: null,
                posterBlockId: null,
                videoContent: {
                  src: null
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
          <Video />
        </EditorProvider>
      </JourneyProvider>
    </MockedProvider>
  )
}

export default VideoStory as Meta
