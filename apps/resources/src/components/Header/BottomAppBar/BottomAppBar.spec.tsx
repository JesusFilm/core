import { render, screen } from '@testing-library/react'

import { BottomAppBar } from './BottomAppBar'

jest.mock('../HeaderTabButtons', () => ({
  HeaderTabButtons: () => <div data-testid="MockedHeaderTabButtons" />
}))

describe('BottomAppBar', () => {
  it('should render correctly with default props', () => {
    render(<BottomAppBar />)

    expect(screen.getByTestId('HeaderBottomAppBar')).toBeInTheDocument()
    expect(screen.getByTestId('MockedHeaderTabButtons')).toBeInTheDocument()
  })

  it('should apply fixed position when bottomBarTrigger is true', () => {
    render(<BottomAppBar bottomBarTrigger />)

    expect(screen.getByTestId('HeaderBottomAppBar').parentElement).toHaveStyle({
      position: 'fixed'
    })
  })

  it('should apply absolute position when bottomBarTrigger is false', () => {
    render(<BottomAppBar bottomBarTrigger={false} />)

    expect(screen.getByTestId('HeaderBottomAppBar').parentElement).toHaveStyle({
      position: 'absolute'
    })
  })
})
