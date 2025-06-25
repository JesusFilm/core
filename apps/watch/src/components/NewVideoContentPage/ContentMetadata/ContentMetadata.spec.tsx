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

  it('displays the label text and applies correct color from getLabelDetails', () => {
    render(
      <VideoProvider value={{ content: videos[0] }}>
        <ContentMetadata {...defaultProps} />
      </VideoProvider>
    )

    const labelElement = screen.getByText('Feature Film')
    expect(labelElement).toBeInTheDocument()
    expect(labelElement).toHaveStyle({ color: '#FF9E00' })
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

  it('renders download button with translated text', () => {
    render(
      <VideoProvider value={{ content: videos[0] }}>
        <ContentMetadata {...defaultProps} />
      </VideoProvider>
    )

    const downloadButton = screen.getByRole('button', { name: /Download/i })
    expect(downloadButton).toBeInTheDocument()
    expect(downloadButton).toHaveTextContent('Download')
  })

  it('opens download dialog when download button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <VideoProvider value={{ content: videos[0] }}>
        <ContentMetadata {...defaultProps} />
      </VideoProvider>
    )

    const downloadButton = screen.getByRole('button', { name: /Download/i })
    await user.click(downloadButton)

    expect(screen.getByTestId('DownloadDialog')).toBeInTheDocument()
  })

  it('closes download dialog when onClose is called', async () => {
    const user = userEvent.setup()
    render(
      <VideoProvider value={{ content: videos[0] }}>
        <ContentMetadata {...defaultProps} />
      </VideoProvider>
    )

    const downloadButton = screen.getByRole('button', { name: /Download/i })
    await user.click(downloadButton)

    const closeButton = screen.getByTestId('dialog-close-button')
    await user.click(closeButton)

    await waitFor(() => {
      expect(screen.queryByTestId('DownloadDialog')).not.toBeInTheDocument()
    })
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
