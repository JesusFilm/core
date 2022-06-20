import { render } from '@testing-library/react'
import { ReportSkeleton } from '.'

describe('ReportSkeleton', () => {
  it('renders the message', () => {
    const { getByText } = render(
      <ReportSkeleton message="The analytics are loading" />
    )
    expect(getByText('The analytics are loading')).toBeInTheDocument()
  })
})
