import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { render, screen } from '@testing-library/react'
import { AnalyticsOverlaySwitch } from '.'

describe('AnalyticsOverlaySwitch', () => {
  it('toggles showAnalytics', () => {
    render(
      <EditorProvider>
        {({ state: { showAnalytics } }) => (
          <>
            <div data-testid="showAnalytics">{showAnalytics?.toString()}</div>
            <AnalyticsOverlaySwitch />
          </>
        )}
      </EditorProvider>
    )
    const state = screen.getByTestId('showAnalytics')
    expect(state).toHaveTextContent('')
    screen.getByRole('checkbox').click()
    expect(state).toHaveTextContent('true')
    screen.getByRole('checkbox').click()
    expect(state).toHaveTextContent('false')
  })
})
