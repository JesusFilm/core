// Tests for NavigationCard

import { ActiveJourneyEditContent } from '@core/journeys/ui/EditorProvider'
import { render } from '@testing-library/react'
import { NavigationCard } from './NavigationCard'

describe('NavigationCard', () => {
  it('should display title', () => {
    const { getByText } = render(
      <NavigationCard
        title="Test"
        destination={ActiveJourneyEditContent.Canvas}
        outlined={false}
        onSelect={jest.fn()}
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
        onSelect={jest.fn()}
        header={<div data-testid="header" />}
      />
    )
    expect(getByTestId('header')).toBeInTheDocument()
  })
  it('should call onSelect to view when clicked', () => {
    const onSelect = jest.fn()
    const { getByTestId } = render(
      <NavigationCard
        id="social"
        title="Test"
        destination={ActiveJourneyEditContent.Canvas}
        outlined={false}
        onSelect={onSelect}
        header={<div />}
      />
    )
    getByTestId('navigation-card-button').click()
    expect(onSelect).toBeCalledWith({ view: ActiveJourneyEditContent.Canvas })
  })
  it('should display outline when outlined is true', () => {
    const { getByTestId } = render(
      <NavigationCard
        id="social"
        testId="test-id"
        title="Test"
        destination={ActiveJourneyEditContent.Canvas}
        outlined
        onSelect={jest.fn()}
        header={<div />}
      />
    )
    expect(getByTestId('test-id')).toHaveStyle({
      outline: '2px solid #1976d2'
    })
  })
})
