import { render, screen } from '@testing-library/react'

import { VideoMetadata } from '.'

jest.mock('@/components/StudyQuestions', () => ({
  StudyQuestions: ({ questions }: { questions: unknown[] }) => (
    <div data-testid="study-questions">{questions.length} questions</div>
  )
}))

describe('VideoMetadata', () => {
  it('renders title', () => {
    render(
      <VideoMetadata
        title="Test Video Title"
        description={[]}
        studyQuestions={[]}
      />
    )

    expect(screen.getByText('Test Video Title')).toBeInTheDocument()
  })

  it('renders description text', () => {
    const description = [{ value: 'This is a test description', primary: true }]

    render(
      <VideoMetadata
        title="Test Video"
        description={description}
        studyQuestions={[]}
      />
    )

    expect(screen.getByText('This is a test description')).toBeInTheDocument()
  })

  it('does not render description section when empty', () => {
    render(
      <VideoMetadata title="Test Video" description={[]} studyQuestions={[]} />
    )

    expect(screen.queryByText(/description/i)).not.toBeInTheDocument()
  })

  it('converts URLs in description to links', () => {
    const description = [
      { value: 'Visit https://example.com for more info', primary: true }
    ]

    render(
      <VideoMetadata
        title="Test Video"
        description={description}
        studyQuestions={[]}
      />
    )

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', 'https://example.com')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('converts www URLs to links with https', () => {
    const description = [{ value: 'Check www.example.com', primary: true }]

    render(
      <VideoMetadata
        title="Test Video"
        description={description}
        studyQuestions={[]}
      />
    )

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', 'https://www.example.com')
  })

  it('converts domain-only URLs to links', () => {
    const description = [{ value: 'Visit example.com today', primary: true }]

    render(
      <VideoMetadata
        title="Test Video"
        description={description}
        studyQuestions={[]}
      />
    )

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', 'https://example.com')
  })

  it('handles multiple URLs in description', () => {
    const description = [
      { value: 'Visit https://example.com and www.test.com', primary: true }
    ]

    render(
      <VideoMetadata
        title="Test Video"
        description={description}
        studyQuestions={[]}
      />
    )

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2)
    expect(links[0]).toHaveAttribute('href', 'https://example.com')
    expect(links[1]).toHaveAttribute('href', 'https://www.test.com')
  })

  it('preserves text around URLs', () => {
    const description = [
      { value: 'Before https://example.com after', primary: true }
    ]

    render(
      <VideoMetadata
        title="Test Video"
        description={description}
        studyQuestions={[]}
      />
    )

    expect(screen.getByText(/Before/)).toBeInTheDocument()
    expect(screen.getByText(/after/)).toBeInTheDocument()
    expect(screen.getByRole('link')).toBeInTheDocument()
  })

  it('renders StudyQuestions when provided', () => {
    const studyQuestions = [
      { value: 'Question 1?', primary: true },
      { value: 'Question 2?', primary: false }
    ]

    render(
      <VideoMetadata
        title="Test Video"
        description={[]}
        studyQuestions={studyQuestions}
      />
    )

    expect(screen.getByTestId('study-questions')).toBeInTheDocument()
    expect(screen.getByText('2 questions')).toBeInTheDocument()
  })

  it('does not render StudyQuestions when empty', () => {
    render(
      <VideoMetadata title="Test Video" description={[]} studyQuestions={[]} />
    )

    expect(screen.queryByTestId('study-questions')).not.toBeInTheDocument()
  })

  it('handles description with newlines', () => {
    const description = [{ value: 'Line 1\nLine 2', primary: true }]

    render(
      <VideoMetadata
        title="Test Video"
        description={description}
        studyQuestions={[]}
      />
    )

    const text = screen.getByText(/Line 1/)
    expect(text).toBeInTheDocument()
  })

  it('handles empty description value', () => {
    const description = [{ value: '', primary: true }]

    render(
      <VideoMetadata
        title="Test Video"
        description={description}
        studyQuestions={[]}
      />
    )

    expect(screen.queryByText(/description/i)).not.toBeInTheDocument()
  })
})
