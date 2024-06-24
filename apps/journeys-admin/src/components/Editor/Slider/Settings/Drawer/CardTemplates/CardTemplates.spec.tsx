import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import type { JourneyFields as Journey } from '../../../../../../../__generated__/JourneyFields'
import { TestEditorState } from '../../../../../../libs/TestEditorState'

import { step } from './CardTemplates.data'

import { CardTemplates } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

const cardTemplates = (
  <MockedProvider>
    <JourneyProvider
      value={{ journey: { id: 'journeyId' } as unknown as Journey }}
    >
      <EditorProvider initialState={{ steps: [step] }}>
        <TestEditorState />
        <CardTemplates />
      </EditorProvider>
    </JourneyProvider>
  </MockedProvider>
)

async function expectBlockToBeSelected(getByText): Promise<void> {
  expect(getByText('selectedBlock: stepId')).toBeInTheDocument()
  expect(getByText('selectedAttributeId:')).toBeInTheDocument()
}

describe('CardTemplates', () => {
  it('renders cta template', async () => {
    const { getByAltText, getByText } = render(cardTemplates)
    expect(getByAltText('Card CTA Template')).toBeInTheDocument()
    await expectBlockToBeSelected(getByText)
  })

  it('renders form template', async () => {
    const { getByAltText, getByText } = render(cardTemplates)
    expect(getByAltText('Card Form Template')).toBeInTheDocument()
    await expectBlockToBeSelected(getByText)
  })

  it('renders intro template', async () => {
    const { getByAltText, getByText } = render(cardTemplates)
    expect(getByAltText('Card Intro Template')).toBeInTheDocument()
    await expectBlockToBeSelected(getByText)
  })

  it('renders poll template', async () => {
    const { getByAltText, getByText } = render(cardTemplates)
    expect(getByAltText('Card Poll Template')).toBeInTheDocument()
    await expectBlockToBeSelected(getByText)
  })

  it('renders quote template', async () => {
    const { getByAltText, getByText } = render(cardTemplates)
    expect(getByAltText('Card Quote Template')).toBeInTheDocument()
    await expectBlockToBeSelected(getByText)
  })

  it('renders video template', async () => {
    const { getByAltText, getByText } = render(cardTemplates)
    expect(getByAltText('Card Video Template')).toBeInTheDocument()
    await expectBlockToBeSelected(getByText)
  })

  it('updates loading state when video clicked', async () => {
    const { getByRole, getAllByTestId } = render(cardTemplates)
    fireEvent.click(getByRole('button', { name: 'Card Video Template' }))
    await waitFor(() =>
      expect(getAllByTestId('card-template-skeleton')).toHaveLength(6)
    )
  })

  it('updates loading state when intro clicked', async () => {
    const { getByRole, getAllByTestId } = render(cardTemplates)
    fireEvent.click(getByRole('button', { name: 'Card Intro Template' }))
    await waitFor(() =>
      expect(getAllByTestId('card-template-skeleton')).toHaveLength(6)
    )
  })

  it('updates loading state when poll clicked', async () => {
    const { getByRole, getAllByTestId } = render(cardTemplates)
    fireEvent.click(getByRole('button', { name: 'Card Poll Template' }))
    await waitFor(() =>
      expect(getAllByTestId('card-template-skeleton')).toHaveLength(6)
    )
  })

  it('updates loading state when form clicked', async () => {
    const { getByRole, getAllByTestId } = render(cardTemplates)
    fireEvent.click(getByRole('button', { name: 'Card Form Template' }))
    await waitFor(() =>
      expect(getAllByTestId('card-template-skeleton')).toHaveLength(6)
    )
  })

  it('updates loading state when quote clicked', async () => {
    const { getByRole, getAllByTestId } = render(cardTemplates)
    fireEvent.click(getByRole('button', { name: 'Card Quote Template' }))
    await waitFor(() =>
      expect(getAllByTestId('card-template-skeleton')).toHaveLength(6)
    )
  })

  it('updates loading state when cta clicked', async () => {
    const { getByRole, getAllByTestId } = render(cardTemplates)
    fireEvent.click(getByRole('button', { name: 'Card CTA Template' }))
    await waitFor(() =>
      expect(getAllByTestId('card-template-skeleton')).toHaveLength(6)
    )
  })
})
