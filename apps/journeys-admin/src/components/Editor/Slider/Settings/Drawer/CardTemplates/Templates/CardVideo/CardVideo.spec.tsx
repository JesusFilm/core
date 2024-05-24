import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { VideoBlockSource } from '../../../../../../../../../__generated__/globalTypes'
import { JourneyFields as Journey } from '../../../../../../../../../__generated__/JourneyFields'

import { CARD_VIDEO_CREATE } from './CardVideo'

import { CardVideo } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

const setLoadingMock = jest.fn()

const card: TreeBlock = {
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

const step: TreeBlock = {
  id: 'stepId',
  __typename: 'StepBlock',
  parentBlockId: null,
  parentOrder: 0,
  locked: false,
  nextBlockId: null,
  children: [card]
}

const cardVideoResult = jest.fn(() => ({
  data: {
    video: {
      __typename: 'VideoBlock',
      id: 'videoBlockId',
      parentBlockId: 'cardId',
      parentOrder: 0,
      muted: false,
      autoplay: true,
      startAt: 2048,
      endAt: 2058,
      posterBlockId: null,
      fullsize: true,
      videoId: '1_jf-0-0',
      videoVariantLanguageId: '529',
      source: VideoBlockSource.internal,
      title: null,
      description: null,
      image: null,
      duration: null,
      objectFit: null,
      video: null,
      action: null
    }
  }
}))

const cardVideoCreateMock = {
  request: {
    query: CARD_VIDEO_CREATE,
    variables: {
      videoInput: {
        journeyId: 'journeyId',
        parentBlockId: 'cardId',
        videoId: '1_jf-0-0',
        videoVariantLanguageId: '529',
        startAt: 2048,
        endAt: 2058,
        autoplay: true,
        muted: false,
        source: VideoBlockSource.internal
      }
    }
  },
  result: cardVideoResult
}

const cachedJourney = {
  'Journey:journeyId': {
    blocks: [{ __ref: 'StepBlock:stepId' }, { __ref: 'CardBlock:cardId' }],
    id: 'journeyId',
    __typename: 'Journey'
  }
}

describe('CardVideo', () => {
  it('updates local cache with card content', async () => {
    const cache = new InMemoryCache()
    cache.restore(cachedJourney)
    const { getByRole } = render(
      <MockedProvider cache={cache} mocks={[cardVideoCreateMock]}>
        <JourneyProvider
          value={{ journey: { id: 'journeyId' } as unknown as Journey }}
        >
          <EditorProvider initialState={{ steps: [step] }}>
            <CardVideo setCardTemplatesLoading={setLoadingMock} />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Card Video Template' }))
    await waitFor(() => {
      expect(cache.extract()['Journey:journeyId']?.blocks).toEqual([
        { __ref: 'StepBlock:stepId' },
        { __ref: 'CardBlock:cardId' },
        { __ref: 'VideoBlock:videoBlockId' }
      ])
    })
  })

  it('updates loading state when clicked', async () => {
    const { getByRole } = render(
      <MockedProvider mocks={[cardVideoCreateMock]}>
        <JourneyProvider
          value={{ journey: { id: 'journeyId' } as unknown as Journey }}
        >
          <EditorProvider initialState={{ steps: [step] }}>
            <CardVideo setCardTemplatesLoading={setLoadingMock} />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Card Video Template' }))
    await waitFor(() => expect(cardVideoResult).toHaveBeenCalled())
    await waitFor(() => expect(setLoadingMock).toHaveBeenCalled())
  })
})
