import { render } from '@testing-library/react'
import { ReactionButton } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('ReactionButton', () => {
  it('should render thumbs up or like button', () => {
    const { getByTestId } = render(<ReactionButton variant="thumbsup" />)
    expect(getByTestId('ThumbsUpIcon')).toBeInTheDocument()
  })

  it('should render thumbs down or dislike button', () => {
    const { getByTestId } = render(<ReactionButton variant="thumbsdown" />)
    expect(getByTestId('ThumbsDownIcon')).toBeInTheDocument()
  })
})
