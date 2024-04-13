import Box from '@mui/material/Box'
import { render } from '@testing-library/react'

import { PageWrapper } from '.'

describe('PageWrapper', () => {
  it('should render header and footer', () => {
    const { getByRole } = render(<PageWrapper languageId="en" />)
    expect(getByRole('banner')).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'open header menu' })
    ).toBeInTheDocument()
    expect(getByRole('contentinfo')).toBeInTheDocument()
  })

  it('should not render header', () => {
    const { queryByRole } = render(<PageWrapper languageId="en" hideHeader />)
    expect(queryByRole('banner')).not.toBeInTheDocument()
  })

  it('should render hero', () => {
    const { getByTestId } = render(
      <PageWrapper languageId="en" hero={<Box data-testid="hero" />} />
    )
    expect(getByTestId('hero')).toBeInTheDocument()
  })

  it('should render children', () => {
    const { getByTestId } = render(
      <PageWrapper languageId="en">
        <Box data-testid="content" />
      </PageWrapper>
    )
    expect(getByTestId('content')).toBeInTheDocument()
  })
})
