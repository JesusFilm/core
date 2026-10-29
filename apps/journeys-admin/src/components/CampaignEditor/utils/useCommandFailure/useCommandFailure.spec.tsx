import { CombinedGraphQLErrors } from '@apollo/client'
import { act, renderHook, screen } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { ReactElement, ReactNode } from 'react'

import { useCommandFailure } from './useCommandFailure'

function wrapper({ children }: { children: ReactNode }): ReactElement {
  return <SnackbarProvider>{children}</SnackbarProvider>
}

function report(error: unknown, fallback?: string): void {
  const { result } = renderHook(() => useCommandFailure(), { wrapper })
  act(() => result.current(error, fallback))
}

describe('useCommandFailure', () => {
  it('shows the GraphQL error’s message verbatim in the snackbar', async () => {
    report(
      new CombinedGraphQLErrors({
        errors: [{ message: 'primaryColor must be a hex colour like #RRGGBB' }]
      })
    )

    expect(
      await screen.findByText('primaryColor must be a hex colour like #RRGGBB')
    ).toBeInTheDocument()
  })

  it('shows the GraphQL error’s message rather than the fallback', async () => {
    report(
      new CombinedGraphQLErrors({
        errors: [{ message: 'Journey not found or not published' }]
      }),
      'Could not refresh from journey'
    )

    expect(
      await screen.findByText('Journey not found or not published')
    ).toBeInTheDocument()
    expect(
      screen.queryByText('Could not refresh from journey')
    ).not.toBeInTheDocument()
  })

  it('shows an Error’s message', async () => {
    report(new Error('Network request failed'))

    expect(
      await screen.findByText('Network request failed')
    ).toBeInTheDocument()
  })

  it('shows an Error’s own message even when a fallback is given', async () => {
    report(
      new Error('Network request failed'),
      'Could not refresh from journey'
    )

    expect(
      await screen.findByText('Network request failed')
    ).toBeInTheDocument()
    expect(
      screen.queryByText('Could not refresh from journey')
    ).not.toBeInTheDocument()
  })

  it('shows the fallback when the error is undefined', async () => {
    report(undefined, 'Journey not found or not published')

    expect(
      await screen.findByText('Journey not found or not published')
    ).toBeInTheDocument()
  })

  it('shows the fallback when the error is a string', async () => {
    report('refused', 'Could not refresh from journey')

    expect(
      await screen.findByText('Could not refresh from journey')
    ).toBeInTheDocument()
    expect(screen.queryByText('refused')).not.toBeInTheDocument()
  })

  it('shows a non-Error as a string when there is no fallback', async () => {
    report('refused')

    expect(await screen.findByText('refused')).toBeInTheDocument()
  })

  it('shows an undefined error as the text undefined when there is no fallback', async () => {
    report(undefined)

    expect(await screen.findByText('undefined')).toBeInTheDocument()
  })
})
