import { render, screen } from '@testing-library/react'
import React from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'
import { TreeBlock } from '@core/journeys/ui/block'

import { CardsPreview } from './CardsPreview'

function buildSteps(count: number): Array<TreeBlock<any>> {
  return Array.from({ length: count }, (_, i) => ({
    id: `step-${i}`,
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: i,
    children: [
      {
        id: `card-${i}`,
        __typename: 'CardBlock',
        parentBlockId: `step-${i}`,
        parentOrder: 0,
        themeName: 'base',
        themeMode: 'dark'
      } as unknown as TreeBlock<any>
    ]
  })) as Array<TreeBlock<any>>
}

describe('CardsPreview', () => {
  it('should render cards', () => {
    const steps = buildSteps(3)
    render(
      <JourneyProvider value={{ journey: defaultJourney, variant: 'admin' }}>
        <CardsPreview steps={steps} />
      </JourneyProvider>
    )
    expect(screen.getAllByTestId('CardsSwiperSlide')).toHaveLength(3)
    expect(screen.getAllByTestId('CardsPreviewItem')).toHaveLength(3)
    expect(screen.queryByTestId('CardsRemainingSlide')).toBeNull()
  })

  it('should render overflow card with correct remaining count', () => {
    const steps = buildSteps(10)
    render(
      <JourneyProvider value={{ journey: defaultJourney, variant: 'admin' }}>
        <CardsPreview steps={steps} />
      </JourneyProvider>
    )
    // Renders first 7 slides + remaining slide
    expect(screen.getAllByTestId('CardsSwiperSlide')).toHaveLength(7)
    expect(screen.getByTestId('CardsRemainingSlide')).toBeInTheDocument()
    expect(screen.getByText('3 more cards')).toBeInTheDocument()
  })

  it('should render loading skeleton when steps are empty', () => {
    render(
      <JourneyProvider value={{ journey: defaultJourney, variant: 'admin' }}>
        <CardsPreview steps={[]} />
      </JourneyProvider>
    )
    expect(screen.getByTestId('CardsPreviewPlaceholder')).toBeInTheDocument()
    expect(screen.getByTestId('CardsPreviewSkeleton')).toBeInTheDocument()
    expect(screen.queryByTestId('CardsSwiperSlide')).toBeNull()
  })
})
