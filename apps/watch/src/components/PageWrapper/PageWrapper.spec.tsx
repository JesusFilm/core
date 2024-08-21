import Box from '@mui/material/Box'
import { render, screen } from '@testing-library/react'

import { PageWrapper } from '.'

describe('PageWrapper', () => {
  it('should render header and footer', () => {
    const { getByRole } = render(<PageWrapper />)
    expect(getByRole('banner')).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'open header menu' })
    ).toBeInTheDocument()
    expect(getByRole('contentinfo')).toBeInTheDocument()
  })

  it('should not render header', () => {
    const { queryByRole } = render(<PageWrapper hideHeader />)
    expect(queryByRole('banner')).not.toBeInTheDocument()
  })

  it('should render hero', () => {
    const { getByTestId } = render(
      <PageWrapper hero={<Box data-testid="hero" />} />
    )
    expect(getByTestId('hero')).toBeInTheDocument()
  })

  it('should render children', () => {
    const { getByTestId } = render(
      <PageWrapper>
        <Box data-testid="content" />
      </PageWrapper>
    )
    expect(getByTestId('content')).toBeInTheDocument()
  })

  it('should not render header spacer', () => {
    render(<PageWrapper hideHeaderSpacer />)
    expect(screen.queryByTestId('HeaderSpacer')).not.toBeInTheDocument()
  })
})
