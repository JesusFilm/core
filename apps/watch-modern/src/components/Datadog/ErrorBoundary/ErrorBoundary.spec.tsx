import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'

import DatadogErrorBoundary from './ErrorBoundary'

vi.mock('@datadog/browser-rum-react', () => ({
  ErrorBoundary: ({ children }: { children: ReactNode }) => (
    <div data-testid="datadog-error-boundary">{children}</div>
  )
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key
}))

describe('DatadogErrorBoundary', () => {
  it('keeps children mounted inside the Datadog RUM error boundary', () => {
    render(
      <DatadogErrorBoundary>
        <main>Watch content</main>
      </DatadogErrorBoundary>
    )

    expect(screen.getByTestId('datadog-error-boundary')).toContainElement(
      screen.getByText('Watch content')
    )
  })
})
