import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { render, screen } from '@testing-library/react'

import { PageWrapper } from '.'

jest.mock('../LocaleSuggestionBanner', () => ({
  LocaleSuggestionBanner: () => null
}))

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

  it('should not render header', () => {
    const { queryByRole } = render(
      <MockedProvider>
        <PageWrapper hideHeader />
      </MockedProvider>
    )
    expect(queryByRole('banner')).not.toBeInTheDocument()
  })

  it('should render hero', () => {
    const { getByTestId } = render(
      <MockedProvider>
        <PageWrapper hero={<Box data-testid="hero" />} />
      </MockedProvider>
    )
    expect(getByTestId('hero')).toBeInTheDocument()
  })

  it('should render children', () => {
    const { getByTestId } = render(
      <MockedProvider>
        <PageWrapper>
          <Box data-testid="content" />
        </PageWrapper>
      </MockedProvider>
    )
    expect(getByTestId('content')).toBeInTheDocument()
  })

  it('should not render header spacer', () => {
    render(
      <MockedProvider>
        <PageWrapper hideHeaderSpacer />
      </MockedProvider>
    )
    expect(screen.queryByTestId('HeaderSpacer')).not.toBeInTheDocument()
  })
})
