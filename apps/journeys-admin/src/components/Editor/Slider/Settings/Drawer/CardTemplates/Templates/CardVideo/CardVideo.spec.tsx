import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { JourneyFields as Journey } from '../../../../../../../../../__generated__/JourneyFields'
import { cachedJourney, step } from '../../CardTemplates.mocks'

import { cardVideoCreateMock, cardVideoResult } from './CardVideo.mocks'

import { CardVideo } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

const setLoadingMock = jest.fn()

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
