import { render, screen } from '@testing-library/react'

import { StudyQuestions } from '.'

describe('StudyQuestions', () => {
  it('renders questions list', () => {
    const questions = [
      { value: 'What is the main theme?', primary: true },
      { value: 'How does this relate to your life?', primary: false }
    ]

    render(<StudyQuestions questions={questions} />)

    expect(screen.getByText('title')).toBeInTheDocument()
    expect(screen.getByText('What is the main theme?')).toBeInTheDocument()
    expect(
      screen.getByText('How does this relate to your life?')
    ).toBeInTheDocument()
    expect(screen.getByText('1.')).toBeInTheDocument()
    expect(screen.getByText('2.')).toBeInTheDocument()
  })

  it('numbers questions correctly', () => {
    const questions = [
      { value: 'First question?', primary: true },
      { value: 'Second question?', primary: false },
      { value: 'Third question?', primary: true }
    ]

    render(<StudyQuestions questions={questions} />)

    expect(screen.getByText('First question?')).toBeInTheDocument()
    expect(screen.getByText('Second question?')).toBeInTheDocument()
    expect(screen.getByText('Third question?')).toBeInTheDocument()
    expect(screen.getByText('1.')).toBeInTheDocument()
    expect(screen.getByText('2.')).toBeInTheDocument()
    expect(screen.getByText('3.')).toBeInTheDocument()
  })

  it('renders empty fragment when questions array is empty', () => {
    const { container } = render(<StudyQuestions questions={[]} />)

    expect(container.firstChild).toBeNull()
  })

  it('displays title', () => {
    const questions = [{ value: 'Test question?', primary: true }]

    render(<StudyQuestions questions={questions} />)

    expect(screen.getByText('title')).toBeInTheDocument()
  })

  it('renders single question', () => {
    const questions = [{ value: 'Only question?', primary: true }]

    render(<StudyQuestions questions={questions} />)

    expect(screen.getByText('Only question?')).toBeInTheDocument()
    expect(screen.getByText('1.')).toBeInTheDocument()
  })
})
