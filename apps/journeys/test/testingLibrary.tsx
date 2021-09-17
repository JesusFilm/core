import { ReactElement } from 'react'
import { render, RenderOptions, RenderResult } from '@testing-library/react'
import { ApolloProvider } from '@apollo/client'
import client from '../src/libs/client'

function renderWithApolloClient(
  ui: React.ReactElement,
  { ...renderOptions }: Omit<RenderOptions, 'queries'> = {}
): RenderResult {
  function Wrapper({ children }): ReactElement {
    return <ApolloProvider client={client}>{children}</ApolloProvider>
  }
  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

export * from '@testing-library/react'
export { renderWithApolloClient }
