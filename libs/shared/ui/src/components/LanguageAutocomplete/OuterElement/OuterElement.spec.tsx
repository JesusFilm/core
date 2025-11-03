import { render, screen } from '@testing-library/react'

import { OuterElement, OuterElementContext } from './OuterElement'

describe('OuterElement', () => {
  it('applies context values from OuterElementContext', () => {
    const contextValue = { className: 'test-class', style: { color: 'red' } }

    render(
      <OuterElementContext.Provider value={contextValue}>
        <OuterElement data-testid="outer-element" />
      </OuterElementContext.Provider>
    )

    const element = screen.getByTestId('outer-element')
    expect(element).toHaveClass('test-class')
    expect(element).toHaveStyle({ color: 'rgb(255, 0, 0)' })
  })
})
