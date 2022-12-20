import { render } from '@testing-library/react'
import Box from '@mui/material/Box'
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
      <PageWrapper hero={<Box data-testId="hero" />} />
    )
    expect(getByTestId('hero')).toBeInTheDocument()
  })

  it('should render children', () => {
    const { getByTestId } = render(
      <PageWrapper>
        <Box data-testId="content" />
      </PageWrapper>
    )
    expect(getByTestId('content')).toBeInTheDocument()
  })
})
