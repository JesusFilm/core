import { render } from '@testing-library/react'
import { SeeAllVideos } from './SeeAllVideos'

describe('SeeAllVideos', () => {
  it('should render hardcoded text', () => {
    const { getByText } = render(<SeeAllVideos />)
    expect(getByText('Conversation Starters')).toBeInTheDocument()
    expect(getByText('+53 Short Evangelical Films')).toBeInTheDocument()
  })

  it('button should have correct link', () => {
    const { getByLabelText } = render(<SeeAllVideos />)
    expect(getByLabelText('all-videos-button')).toHaveAttribute(
      'href',
      '/videos'
    )
  })
})
