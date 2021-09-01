import { render } from '@testing-library/react'

import { BrowserRouter } from 'react-router-dom'

import App from './app'

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )

    expect(baseElement).toBeTruthy()
  })

  it('should render an example link successfully', () => {
    const { getByText } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )

    expect(getByText(/Example 3/)).toBeTruthy()
  })
})
