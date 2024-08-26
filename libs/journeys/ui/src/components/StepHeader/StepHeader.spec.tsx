import { fireEvent, render, screen } from '@testing-library/react'

import { StepHeader } from '.'
import { JourneyProvider } from '../../libs/JourneyProvider'
import { JourneyFields as Journey } from '../../libs/JourneyProvider/__generated__/JourneyFields'

describe('StepHeader', () => {
  it('should handleClick', () => {
    const onHeaderClick = jest.fn()
    render(<StepHeader onHeaderClick={onHeaderClick} />)

    fireEvent.click(screen.getByTestId('JourneysStepHeader'))
    expect(onHeaderClick).toHaveBeenCalled()
  })

  it('should render journey elements', () => {
    render(<StepHeader />)

    expect(screen.getByTestId('InformationButton')).toBeInTheDocument()
    expect(screen.getByTestId('pagination-bullets')).toBeInTheDocument()
  })

  it.skip('should render website elements', () => {
    const journey = {
      __typename: 'Journey',
      id: 'journey.id',
      website: true
    } as unknown as Journey

    render(
      <JourneyProvider value={{ journey }}>
        <StepHeader />
      </JourneyProvider>
    )

    // expect header elements
  })
})
