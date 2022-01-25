import { MockedProvider } from '@apollo/client/testing'
import { InMemoryCache } from '@apollo/client'
import { EditorProvider, TreeBlock } from '@core/journeys/ui'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { JourneyProvider } from '../../../../../libs/context'
import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import { VIDEO_BLOCK_CREATE } from './Video'
import { Video } from '.'

describe('Video', () => {
  const selectedStep: TreeBlock = {
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
  it('should check if the mutation gets called', async () => {
    const result = jest.fn(() => ({
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
    }))
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
            result
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
      </MockedProvider >
    )
    fireEvent.click(getByRole('button'))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should update the cache', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journeyId': {
        blocks: [{ __ref: 'TypographyBlock:typographyBlockId' }],
        id: 'journeyId',
        __typename: 'Journey'
      }
    })
    const result = jest.fn(() => ({
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
          },
          __typename: 'VideoBlock'
        }
      }
    }))
    const { getByRole } = render(
      <MockedProvider
        cache={cache}
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
            result
          }
        ]}
      >
        <JourneyProvider value={{ id: 'journeyId' } as unknown as Journey}>
          <EditorProvider initialState={{ selectedStep }}>
            <Video></Video>
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(cache.extract()['Journey:journeyId']?.blocks).toEqual([
      { __ref: 'TypographyBlock:typographyBlockId' },
      { __ref: 'VideoBlock:videoBlockId' }
    ])
  })
})