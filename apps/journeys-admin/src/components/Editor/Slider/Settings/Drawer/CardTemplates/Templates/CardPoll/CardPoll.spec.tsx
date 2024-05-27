import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { v4 as uuidv4 } from 'uuid'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { JourneyFields as Journey } from '../../../../../../../../../__generated__/JourneyFields'
import { cachedJourney, step } from '../../CardTemplates.mocks'

import { cardPollCreateMock, cardPollResult } from './CardPoll.mocks'

import { CardPoll } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>
const setLoadingMock = jest.fn()

describe('CardPoll', () => {
  beforeEach(() => {
    mockUuidv4.mockReturnValueOnce('radioQuestionId')
  })

  it('updates card content and updates local cache', async () => {
    const cache = new InMemoryCache()
    cache.restore(cachedJourney)

    const { getByRole } = render(
      <MockedProvider cache={cache} mocks={[cardPollCreateMock]}>
        <JourneyProvider
          value={{ journey: { id: 'journeyId' } as unknown as Journey }}
        >
          <EditorProvider initialState={{ steps: [step] }}>
            <CardPoll setCardTemplatesLoading={setLoadingMock} />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Card Poll Template' }))
    await waitFor(() => {
      expect(cache.extract()['Journey:journeyId']?.blocks).toEqual([
        { __ref: 'StepBlock:stepId' },
        { __ref: 'CardBlock:cardId' },
        { __ref: 'ImageBlock:imageId' },
        { __ref: 'TypographyBlock:subtitleId' },
        { __ref: 'TypographyBlock:titleId' },
        { __ref: 'RadioQuestionBlock:radioQuestionId' },
        { __ref: 'RadioOptionBlock:radioOption1Id' },
        { __ref: 'RadioOptionBlock:radioOption2Id' },
        { __ref: 'RadioOptionBlock:radioOption3Id' },
        { __ref: 'RadioOptionBlock:radioOption4Id' },
        { __ref: 'TypographyBlock:bodyId' }
      ])
    })
  })

  it('updates loading state when clicked', async () => {
    const { getByRole } = render(
      <MockedProvider mocks={[cardPollCreateMock]}>
        <JourneyProvider
          value={{ journey: { id: 'journeyId' } as unknown as Journey }}
        >
          <EditorProvider initialState={{ steps: [step] }}>
            <CardPoll setCardTemplatesLoading={setLoadingMock} />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Card Poll Template' }))
    await waitFor(() => expect(cardPollResult).toHaveBeenCalled())
    await waitFor(() => expect(setLoadingMock).toHaveBeenCalled())
  })
})
