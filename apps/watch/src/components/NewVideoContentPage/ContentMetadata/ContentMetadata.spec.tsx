import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { VideoLabel } from '../../../../__generated__/globalTypes'
import { VideoProvider } from '../../../libs/videoContext/VideoContext'
import { videos } from '../../Videos/__generated__/testData'

import { ContentMetadata } from './ContentMetadata'

jest.mock('next-i18next', () => ({
  useTranslation: jest.fn().mockReturnValue({
    t: (key: string) => key
  })
}))

describe('ContentMetadata', () => {
  const defaultProps = {
    title: 'Test Video Title',
    description: 'This is a test video description with more content',
    label: VideoLabel.featureFilm
  }

  it('renders the component with correct test id', () => {
    render(
      <VideoProvider value={{ content: videos[0] }}>
        <ContentMetadata {...defaultProps} />
      </VideoProvider>
    )

    expect(screen.getByTestId('ContentMetadata')).toBeInTheDocument()
  })

  it('displays the title correctly', () => {
    render(
      <VideoProvider value={{ content: videos[0] }}>
        <ContentMetadata {...defaultProps} />
      </VideoProvider>
    )

    expect(screen.getByText('Test Video Title')).toBeInTheDocument()
  })

  it('displays the label text from getLabelDetails', () => {
    render(
      <VideoProvider value={{ content: videos[0] }}>
        <ContentMetadata {...defaultProps} />
      </VideoProvider>
    )

    const labelElement = screen.getByText('Feature Film')
    expect(labelElement).toBeInTheDocument()
  })

  it('formats description with first 3 words in bold', () => {
    render(
      <VideoProvider value={{ content: videos[0] }}>
        <ContentMetadata {...defaultProps} />
      </VideoProvider>
    )

    const boldText = screen.getByText('This is a')
    expect(boldText).toBeInTheDocument()
    expect(boldText).toHaveClass('font-bold text-white')
  })

  it('handles short descriptions correctly', () => {
    render(
      <VideoProvider value={{ content: videos[0] }}>
        <ContentMetadata {...defaultProps} description="One two" />
      </VideoProvider>
    )

    const boldText = screen.getByText('One two')
    expect(boldText).toBeInTheDocument()
    expect(boldText).toHaveClass('font-bold text-white')
  })

  it('handles single word descriptions', () => {
    render(
      <VideoProvider value={{ content: videos[0] }}>
        <ContentMetadata {...defaultProps} description="Word" />
      </VideoProvider>
    )

    const boldText = screen.getByText('Word')
    expect(boldText).toBeInTheDocument()
    expect(boldText).toHaveClass('font-bold text-white')
  })
})
