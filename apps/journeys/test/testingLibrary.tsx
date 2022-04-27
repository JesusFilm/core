import { ReactElement } from 'react'
import { render, RenderOptions, RenderResult } from '@testing-library/react'
import { ApolloProvider } from '@apollo/client'
import { createApolloClient } from '../src/libs/client'

function renderWithApolloClient(
  ui: React.ReactElement,
  { ...renderOptions }: Omit<RenderOptions, 'queries'> = {}
): RenderResult {
  function Wrapper({ children }): ReactElement {
    const client = createApolloClient()
    return <ApolloProvider client={client}>{children}</ApolloProvider>
  }
  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

export * from '@testing-library/react'
export { renderWithApolloClient }
