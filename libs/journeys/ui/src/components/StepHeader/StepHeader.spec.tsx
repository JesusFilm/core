import { fireEvent, render, screen } from '@testing-library/react'

import { JourneyProvider } from '../../libs/JourneyProvider'
import { defaultJourney } from '../TemplateView/data'

import { StepHeader } from '.'

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

  it('should render website elements', () => {
    render(
      <JourneyProvider
        value={{
          journey: {
            ...defaultJourney,
            website: true,
            displayTitle: 'Journey display title'
          }
        }}
      >
        <StepHeader />
      </JourneyProvider>
    )

    expect(screen.getByText('Journey display title')).toBeInTheDocument()
  })
})
