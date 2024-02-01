import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'

import { VIDEO_BLOCK_CREATE } from './NewVideoButton'

import { NewVideoButton } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('NewVideoButton', () => {
  const selectedStep: TreeBlock = {
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

  it('should check if the mutation gets called', async () => {
    const result = jest.fn(() => ({
      data: {
        videoBlockCreate: {
          id: 'videoBlockId',
          parentBlockId: 'cardId',
          parentOrder: 0,
          journeyId: 'journeyId',
          title: '',
          muted: false,
          autoplay: true,
          startAt: null,
          endAt: null,
          posterBlockId: null,
          video: null,
          fullsize: true,
          videoId: null
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
                  fullsize: true
                }
              }
            },
            result
          }
        ]}
      >
        <JourneyProvider
          value={{
            journey: { id: 'journeyId' } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider initialState={{ selectedStep }}>
            <NewVideoButton />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
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
          parentOrder: 0,
          journeyId: 'journeyId',
          title: '',
          muted: false,
          autoplay: true,
          startAt: null,
          endAt: null,
          posterBlockId: null,
          video: null,
          __typename: 'VideoBlock',
          fullsize: true,
          videoId: null,
          videoVariantLanguageId: null,
          action: null
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
                  fullsize: true
                }
              }
            },
            result
          }
        ]}
      >
        <JourneyProvider
          value={{
            journey: { id: 'journeyId' } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider initialState={{ selectedStep }}>
            <NewVideoButton />
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
