import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider } from '@core/journeys/ui'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { JourneyProvider } from 'apps/journeys-admin/src/libs/context'
import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import { Video, VIDEO_BLOCK_CREATE } from '.'

describe('Video', () => {
  it('should check if the mutation gets called', async () => {
    const result = jest.fn()
    const { getByRole } = render(
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
            result: () => {
              result()
              return {}
            }
          }
        ]}
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
    fireEvent.click(getByRole('button'))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})