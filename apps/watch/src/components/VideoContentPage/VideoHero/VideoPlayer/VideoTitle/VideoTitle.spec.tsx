import { render, screen } from '@testing-library/react'

import { VideoTitle } from './VideoTitle'

describe('VideoTitle', () => {
  const defaultProps = {
    play: false,
    videoTitle: 'Test Video Title',
    videoSnippet: 'Test video snippet description'
  }

  it('should render the video title', () => {
    render(<VideoTitle {...defaultProps} />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Test Video Title'
    )
  })

  it('should render the video snippet', () => {
    render(<VideoTitle {...defaultProps} />)

    expect(screen.getByTestId('ContainerHeroDescription')).toHaveTextContent(
      'Test video snippet description'
    )
  })

  it('should render both title and snippet with different content', () => {
    const customProps = {
      ...defaultProps,
      videoTitle: 'Another Video Title',
      videoSnippet: 'Another snippet text'
    }

    render(<VideoTitle {...customProps} />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Another Video Title'
    )
    expect(screen.getByTestId('ContainerHeroDescription')).toHaveTextContent(
      'Another snippet text'
    )
  })
})
