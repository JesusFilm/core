import { render, screen } from '@testing-library/react'
import { ReactElement } from 'react'

import { EditorLayoutProvider, useEditorLayout } from '.'

function TestComponent(): ReactElement {
  const { layout, isLayered } = useEditorLayout()
  return (
    <div data-testid="layout">
      {layout}:{isLayered.toString()}
    </div>
  )
}

describe('EditorLayoutContext', () => {
  it('defaults to slider layout when no provider is mounted', () => {
    render(<TestComponent />)

    expect(screen.getByTestId('layout')).toHaveTextContent('slider:false')
  })

  it('returns slider layout from provider', () => {
    render(
      <EditorLayoutProvider value="slider">
        <TestComponent />
      </EditorLayoutProvider>
    )

    expect(screen.getByTestId('layout')).toHaveTextContent('slider:false')
  })

  it('returns layered layout from provider', () => {
    render(
      <EditorLayoutProvider value="layered">
        <TestComponent />
      </EditorLayoutProvider>
    )

    expect(screen.getByTestId('layout')).toHaveTextContent('layered:true')
  })
})
