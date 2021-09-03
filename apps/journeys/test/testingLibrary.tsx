import { ReactElement } from 'react'
import { render, RenderOptions, RenderResult } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStoreWithState, RootState } from '../src/libs/store/store'
import { PreloadedState } from 'redux'

function renderWithStore (
  ui: React.ReactElement,
  {
    preloadedState,
    ...renderOptions
  }: Omit<RenderOptions, 'queries'> & { preloadedState?: PreloadedState<RootState> } = {}
): RenderResult {
  function Wrapper ({ children }): ReactElement {
    return <Provider store={configureStoreWithState(preloadedState)}>{children}</Provider>
  }
  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

export * from '@testing-library/react'
export { renderWithStore }
