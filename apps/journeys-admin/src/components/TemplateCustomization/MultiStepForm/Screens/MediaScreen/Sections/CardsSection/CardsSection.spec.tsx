import { fireEvent, render, screen } from '@testing-library/react'

import { TreeBlock } from '@core/journeys/ui/block'

import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../../../../../../__generated__/GetJourney'

import { CardsSection } from './CardsSection'

jest.mock('next-i18next/pages', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

const createStepBlock = (
  id: string,
  parentOrder: number
): TreeBlock<StepBlock> =>
  ({
    id,
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder,
    locked: false,
    nextBlockId: null,
    slug: null,
    children: []
  }) as TreeBlock<StepBlock>

describe('CardsSection', () => {
  const step1 = createStepBlock('step1.id', 0)
  const step2 = createStepBlock('step2.id', 1)
  const customizableSteps = [step1, step2]
  const handleStepClick = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render with CardsSection', () => {
    render(
      <CardsSection
        customizableSteps={customizableSteps}
        selectedStep={step1}
        handleStepClick={handleStepClick}
      />
    )
    expect(screen.getByTestId('CardsSection')).toBeInTheDocument()
  })

  it('should show Cards label when showLabel is true', () => {
    render(
      <CardsSection
        customizableSteps={customizableSteps}
        selectedStep={step1}
        handleStepClick={handleStepClick}
        showLabel
      />
    )
    expect(screen.getByText('Cards')).toBeInTheDocument()
  })

  it('should hide Cards label when showLabel is false', () => {
    render(
      <CardsSection
        customizableSteps={customizableSteps}
        selectedStep={step1}
        handleStepClick={handleStepClick}
      />
    )
    expect(screen.queryByText('Cards')).not.toBeInTheDocument()
  })

  it('should render step cards via TemplateCardPreview', () => {
    render(
      <CardsSection
        customizableSteps={customizableSteps}
        selectedStep={step2}
        handleStepClick={handleStepClick}
      />
    )
    const items = screen.getAllByTestId('TemplateCardPreviewItem')
    expect(items).toHaveLength(2)
  })

  it('calls handleStepClick when a step card is clicked', () => {
    render(
      <CardsSection
        customizableSteps={customizableSteps}
        selectedStep={step1}
        handleStepClick={handleStepClick}
      />
    )
    const items = screen.getAllByTestId('TemplateCardPreviewItem')
    fireEvent.click(items[0])
    expect(handleStepClick).toHaveBeenCalledWith(step1)
  })
})
