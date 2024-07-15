import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { v4 as uuidv4 } from 'uuid'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import type { JourneyFields as Journey } from '../../../../../../../../../__generated__/JourneyFields'
import { cachedJourney, step } from '../../CardTemplates.data'

import { cardCtaCreateErrorMock, cardCtaCreateMock } from './CardCta.data'

import { CardCta } from '.'

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

describe('CardCta', () => {
  beforeEach(() => {
    mockUuidv4.mockReturnValueOnce('button1Id')
    mockUuidv4.mockReturnValueOnce('startIcon1Id')
    mockUuidv4.mockReturnValueOnce('endIcon1Id')
    mockUuidv4.mockReturnValueOnce('button2Id')
    mockUuidv4.mockReturnValueOnce('startIcon2Id')
    mockUuidv4.mockReturnValueOnce('endIcon2Id')
    mockUuidv4.mockReturnValueOnce('button3Id')
    mockUuidv4.mockReturnValueOnce('startIcon3Id')
    mockUuidv4.mockReturnValueOnce('endIcon3Id')
  })

  it('updates card content and updates local cache', async () => {
    const cache = new InMemoryCache()
    cache.restore(cachedJourney)
    const { getByRole } = render(
      <MockedProvider cache={cache} mocks={[cardCtaCreateMock]}>
        <JourneyProvider
          value={{ journey: { id: 'journeyId' } as unknown as Journey }}
        >
          <EditorProvider initialState={{ steps: [step] }}>
            <CardCta setCardTemplatesLoading={setLoadingMock} />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Card CTA Template' }))
    await waitFor(() => {
      expect(cache.extract()['Journey:journeyId']?.blocks).toEqual([
        { __ref: 'StepBlock:stepId' },
        { __ref: 'CardBlock:cardId' },
        { __ref: 'ImageBlock:imageId' },
        { __ref: 'TypographyBlock:subtitleId' },
        { __ref: 'TypographyBlock:titleId' },
        { __ref: 'ButtonBlock:button1Id' },
        { __ref: 'IconBlock:startIcon1Id' },
        { __ref: 'IconBlock:endIcon1Id' },
        { __ref: 'ButtonBlock:button2Id' },
        { __ref: 'IconBlock:startIcon2Id' },
        { __ref: 'IconBlock:endIcon2Id' },
        { __ref: 'ButtonBlock:button3Id' },
        { __ref: 'IconBlock:startIcon3Id' },
        { __ref: 'IconBlock:endIcon3Id' }
      ])
    })
  })

  it('updates loading state when clicked', async () => {
    const { getByRole } = render(
      <MockedProvider mocks={[cardCtaCreateMock]}>
        <JourneyProvider
          value={{ journey: { id: 'journeyId' } as unknown as Journey }}
        >
          <EditorProvider initialState={{ steps: [step] }}>
            <CardCta setCardTemplatesLoading={setLoadingMock} />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Card CTA Template' }))
    await waitFor(() => expect(cardCtaCreateMock.result).toHaveBeenCalled())
    await waitFor(() => expect(setLoadingMock).toHaveBeenCalled())
  })

  it('updates loading state on error', async () => {
    const { getByRole, getByAltText } = render(
      <MockedProvider mocks={[cardCtaCreateErrorMock]}>
        <JourneyProvider
          value={{ journey: { id: 'journeyId' } as unknown as Journey }}
        >
          <EditorProvider initialState={{ steps: [step] }}>
            <CardCta setCardTemplatesLoading={setLoadingMock} />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Card CTA Template' }))
    await waitFor(() => expect(cardCtaCreateErrorMock.error).toBeDefined())
    await waitFor(() => expect(setLoadingMock).toHaveBeenCalled())
    expect(getByAltText('Card CTA Template')).toBeInTheDocument()
  })
})
