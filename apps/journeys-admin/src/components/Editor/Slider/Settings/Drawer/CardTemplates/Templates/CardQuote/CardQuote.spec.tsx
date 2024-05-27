import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { JourneyFields as Journey } from '../../../../../../../../../__generated__/JourneyFields'
import { cachedJourney, step } from '../../CardTemplates.data'

import { cardQuoteCreateMock, cardQuoteResult } from './CardQuote.data'

import { CardQuote } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

const setLoadingMock = jest.fn()

describe('CardQuote', () => {
  it('updates card content and updates local cache', async () => {
    const cache = new InMemoryCache()
    cache.restore(cachedJourney)

    const { getByRole } = render(
      <MockedProvider cache={cache} mocks={[cardQuoteCreateMock]}>
        <JourneyProvider
          value={{ journey: { id: 'journeyId' } as unknown as Journey }}
        >
          <EditorProvider initialState={{ steps: [step] }}>
            <CardQuote setCardTemplatesLoading={setLoadingMock} />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Card Quote Template' }))
    await waitFor(() => {
      expect(cache.extract()['Journey:journeyId']?.blocks).toEqual([
        { __ref: 'StepBlock:stepId' },
        { __ref: 'CardBlock:cardId' },
        { __ref: 'ImageBlock:imageId' },
        { __ref: 'TypographyBlock:subtitleId' },
        { __ref: 'TypographyBlock:titleId' },
        { __ref: 'TypographyBlock:bodyId' }
      ])
    })
  })

  it('updates loading state when clicked', async () => {
    const { getByRole } = render(
      <MockedProvider mocks={[cardQuoteCreateMock]}>
        <JourneyProvider
          value={{ journey: { id: 'journeyId' } as unknown as Journey }}
        >
          <EditorProvider initialState={{ steps: [step] }}>
            <CardQuote setCardTemplatesLoading={setLoadingMock} />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Card Quote Template' }))
    await waitFor(() => expect(cardQuoteResult).toHaveBeenCalled())
    await waitFor(() => expect(setLoadingMock).toHaveBeenCalled())
  })
})
