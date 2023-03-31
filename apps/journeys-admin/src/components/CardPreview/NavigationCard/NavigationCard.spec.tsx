import { ActiveJourneyEditContent } from '@core/journeys/ui/EditorProvider'
import { render } from '@testing-library/react'
import { NavigationCard } from './NavigationCard'

describe('NavigationCard', () => {
  it('should display title', () => {
    const { getByText } = render(
      <NavigationCard
        id="social"
        title="Test"
        destination={ActiveJourneyEditContent.Canvas}
        outlined={false}
        header={<div />}
      />
    )
    expect(getByText('Test')).toBeInTheDocument()
  })
  it('should display header', () => {
    const { getByTestId } = render(
      <NavigationCard
        id="social"
        title="Test"
        destination={ActiveJourneyEditContent.Canvas}
        outlined={false}
        header={<div data-testid="header" />}
      />
    )
    expect(getByTestId('header')).toBeInTheDocument()
  })

  it('should display outline when outlined is true', () => {
    const { getByTestId } = render(
      <NavigationCard
        id="social"
        testId="test-id"
        title="Test"
        destination={ActiveJourneyEditContent.Canvas}
        outlined
        header={<div />}
      />
    )
    expect(getByTestId('test-id')).toHaveStyle({
      outline: '2px solid #1976d2'
    })
  })
})
