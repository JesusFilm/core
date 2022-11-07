import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import Box from '@mui/material/Box'
import { PageWrapper } from '.'

describe('PageWrapper', () => {
  it('should render header and footer', () => {
    const { getByRole } = render(
      <MockedProvider>
        <PageWrapper />
      </MockedProvider>
    )
    expect(getByRole('banner')).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'open header menu' })
    ).toBeInTheDocument()
    expect(getByRole('contentinfo')).toBeInTheDocument()
  })

  it('should render hero', () => {
    const { getByTestId } = render(
      <MockedProvider>
        <PageWrapper hero={<Box data-testId="hero" />} />
      </MockedProvider>
    )
    expect(getByTestId('hero')).toBeInTheDocument()
  })

  it('should render children', () => {
    const { getByTestId } = render(
      <MockedProvider>
        <PageWrapper>
          <Box data-testId="content" />
        </PageWrapper>
      </MockedProvider>
    )
    expect(getByTestId('content')).toBeInTheDocument()
  })
})
