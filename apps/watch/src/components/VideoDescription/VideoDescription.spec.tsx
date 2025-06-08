import { render, screen } from '@testing-library/react'

import { VideoLabel } from '../../../__generated__/globalTypes'

import { VideoDescription } from './VideoDescription'

describe('VideoDescription Component', () => {
  const mockProps = {
    title: 'Test Title',
    description: 'This is a test description for the video content.',
    label: VideoLabel.featureFilm
  }

  it('renders title correctly', () => {
    render(<VideoDescription {...mockProps} />)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('renders description correctly with first three words in bold', () => {
    render(<VideoDescription {...mockProps} />)

    const description = screen.getByText(
      /This is a test description for the video content./
    )
    expect(description).toBeInTheDocument()

    const boldText = screen.getByText('This is a')
    expect(boldText).toHaveClass('font-bold', 'text-white')
  })

  it('renders label text correctly', () => {
    render(<VideoDescription {...mockProps} />)
    expect(screen.getByText('Feature Film')).toBeInTheDocument()
  })
})
