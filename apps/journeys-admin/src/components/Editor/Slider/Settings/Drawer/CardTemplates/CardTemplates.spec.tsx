import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { TreeBlock } from '@core/journeys/ui/block'

import { JourneyFields as Journey } from '../../../../../../../__generated__/JourneyFields'
import { VideoBlockSource } from '../../../../../../../__generated__/globalTypes'
import { TestEditorState } from '../../../../../../libs/TestEditorState'

import { step } from './CardTemplates.data'
import { cardVideoCreateMock } from './Templates/CardVideo/CardVideo.data'

import { CardTemplates } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

const cardTemplate = (
  <MockedProvider mocks={[cardVideoCreateMock]}>
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

async function expectCardContentToBeUpdated(getByText): Promise<void> {
  await waitFor(() =>
    expect(getByText('selectedBlock: stepId')).toBeInTheDocument()
  )
  expect(getByText('selectedAttributeId:')).toBeInTheDocument()
}

describe('CardTemplates', () => {
  it('changes content of card when video template clicked', async () => {
    const { getByRole, getByText } = render(cardTemplate)
    fireEvent.click(getByRole('button', { name: 'Card Video Template' }))
    await expectCardContentToBeUpdated(getByText)
  })

  it('changes content of card when intro template clicked', async () => {
    const { getByRole, getByText } = render(cardTemplate)
    fireEvent.click(getByRole('button', { name: 'Card Intro Template' }))
    await expectCardContentToBeUpdated(getByText)
  })

  it('changes content of card when poll template clicked', async () => {
    const { getByRole, getByText } = render(cardTemplate)
    fireEvent.click(getByRole('button', { name: 'Card Poll Template' }))
    await expectCardContentToBeUpdated(getByText)
  })

  it('changes content of card when form template clicked', async () => {
    const { getByRole, getByText } = render(cardTemplate)
    fireEvent.click(getByRole('button', { name: 'Card Form Template' }))
    await expectCardContentToBeUpdated(getByText)
  })

  it('changes content of card when quote template clicked', async () => {
    const { getByRole, getByText } = render(cardTemplate)
    fireEvent.click(getByRole('button', { name: 'Card Quote Template' }))
    await expectCardContentToBeUpdated(getByText)
  })

  it('changes content of card when cta template clicked', async () => {
    const { getByRole, getByText } = render(cardTemplate)
    fireEvent.click(getByRole('button', { name: 'Card CTA Template' }))
    await expectCardContentToBeUpdated(getByText)
  })

  it('updates loading state when video clicked', async () => {
    const { getByRole, getAllByTestId } = render(cardTemplate)
    fireEvent.click(getByRole('button', { name: 'Card Video Template' }))
    await waitFor(() =>
      expect(getAllByTestId('card-template-skeleton')).toHaveLength(6)
    )
  })

  it('updates loading state when intro clicked', async () => {
    const { getByRole, getAllByTestId } = render(cardTemplate)
    fireEvent.click(getByRole('button', { name: 'Card Intro Template' }))
    await waitFor(() =>
      expect(getAllByTestId('card-template-skeleton')).toHaveLength(6)
    )
  })

  it('updates loading state when poll clicked', async () => {
    const { getByRole, getAllByTestId } = render(cardTemplate)
    fireEvent.click(getByRole('button', { name: 'Card Poll Template' }))
    await waitFor(() =>
      expect(getAllByTestId('card-template-skeleton')).toHaveLength(6)
    )
  })

  it('updates loading state when form clicked', async () => {
    const { getByRole, getAllByTestId } = render(cardTemplate)
    fireEvent.click(getByRole('button', { name: 'Card Form Template' }))
    await waitFor(() =>
      expect(getAllByTestId('card-template-skeleton')).toHaveLength(6)
    )
  })

  it('updates loading state when quote clicked', async () => {
    const { getByRole, getAllByTestId } = render(cardTemplate)
    fireEvent.click(getByRole('button', { name: 'Card Quote Template' }))
    await waitFor(() =>
      expect(getAllByTestId('card-template-skeleton')).toHaveLength(6)
    )
  })

  it('updates loading state when cta clicked', async () => {
    const { getByRole, getAllByTestId } = render(cardTemplate)
    fireEvent.click(getByRole('button', { name: 'Card CTA Template' }))
    await waitFor(() =>
      expect(getAllByTestId('card-template-skeleton')).toHaveLength(6)
    )
  })
})
