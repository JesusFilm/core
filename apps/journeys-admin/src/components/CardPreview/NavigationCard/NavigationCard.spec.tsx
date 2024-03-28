import { render } from '@testing-library/react'

import { ActiveContent } from '@core/journeys/ui/EditorProvider'

import { NavigationCard } from './NavigationCard'

describe('NavigationCard', () => {
  it('should display title', () => {
    const { getByText } = render(
      <NavigationCard
        id="social"
        title="Test"
        destination={ActiveContent.Canvas}
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
        destination={ActiveContent.Canvas}
        header={<div data-testid="header" />}
      />
    )
    expect(getByTestId('header')).toBeInTheDocument()
  })
})
