import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { render, screen } from '@testing-library/react'

import { PageWrapper } from '.'

describe('PageWrapper', () => {
  it('should render footer', () => {
    render(
      <MockedProvider>
        <PageWrapper />
      </MockedProvider>
    )
    expect(screen.getByTestId('Footer')).toBeInTheDocument()
  })

  it('should not render footer', () => {
    render(
      <MockedProvider>
        <PageWrapper hideFooter />
      </MockedProvider>
    )
    expect(screen.queryByTestId('Footer')).not.toBeInTheDocument()
  })

  it('should render hero', () => {
    render(
      <MockedProvider>
        <PageWrapper hero={<Box data-testid="hero" />} />
      </MockedProvider>
    )
    expect(screen.getByTestId('hero')).toBeInTheDocument()
  })

  it('should render children', () => {
    render(
      <MockedProvider>
        <PageWrapper>
          <Box data-testid="content" />
        </PageWrapper>
      </MockedProvider>
    )
    expect(screen.getByTestId('content')).toBeInTheDocument()
  })
})
