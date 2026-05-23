import { useMutation, useQuery } from '@apollo/client'
import { fireEvent, render, screen } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'
import { type Mock } from 'vitest'

// Import the component under test
import StudyQuestionsList from './default'

// Mock Apollo client
vi.mock('@apollo/client', async () => {
  const original = await vi.importActual('@apollo/client')
  return {
    ...original,
    useMutation: vi.fn(() => [vi.fn(), { loading: false }]),
    useQuery: vi.fn(() => ({
      data: {
        adminVideo: {
          id: 'video-123',
          studyQuestions: [
            { id: 'q1', value: 'First question?', order: 1 },
            { id: 'q2', value: 'Second question?', order: 2 },
            { id: 'q3', value: 'Third question?', order: 3 }
          ]
        }
      },
      loading: false,
      refetch: vi.fn()
    }))
  }
})

// Mock OrderedList component
vi.mock('../../../../../components/OrderedList', () => ({
  OrderedList: ({ children, items }) => (
    <div data-testid="mock-ordered-list" data-items-count={items.length}>
      {children}
    </div>
  )
}))

// Mock OrderedItem component
vi.mock('../../../../../components/OrderedList/OrderedItem', () => ({
  OrderedItem: ({ id, label, idx, menuActions }) => (
    <div data-testid={`mock-ordered-item-${id}`} data-idx={idx}>
      <span data-testid={`item-label-${id}`}>{label}</span>
      <button
        data-testid={`edit-button-${id}`}
        onClick={menuActions[0].handler}
      >
        {menuActions[0].label}
      </button>
      <button
        data-testid={`delete-button-${id}`}
        onClick={menuActions[1].handler}
      >
        {menuActions[1].label}
      </button>
    </div>
  )
}))

// Mock Section component
vi.mock('../../../../../components/Section', () => {
  const Section = ({ children, title, variant }) => (
    <div data-testid="mock-section" data-variant={variant}>
      <h2 data-testid="section-title">{title}</h2>
      <div data-testid="section-content">{children}</div>
    </div>
  )
  Section.Fallback = ({ children }) => (
    <div data-testid="section-fallback">{children}</div>
  )
  return { Section }
})

// Mock Material UI components
vi.mock('@mui/material/Stack', () => ({
  __esModule: true,
  default: ({ children, direction, justifyContent }) => (
    <div
      data-testid="mock-stack"
      data-direction={direction}
      data-justify={justifyContent}
    >
      {children}
    </div>
  )
}))

vi.mock('@mui/material/Button', () => ({
  __esModule: true,
  default: ({ children, variant, onClick, size, color }) => (
    <button
      data-testid="mock-button"
      data-variant={variant}
      data-size={size}
      data-color={color}
      onClick={onClick}
    >
      {children}
    </button>
  )
}))

// Mock router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn()
  })),
  usePathname: () => '/videos/video-123/studyQuestions',
  useParams: () => ({ videoId: 'video-123' })
}))

// Mock notistack
vi.mock('notistack', () => ({
  useSnackbar: vi.fn(() => ({ enqueueSnackbar: vi.fn() }))
}))

describe('StudyQuestionsList', () => {
  const mockVideoId = 'video-123'

  // Mock functions
  const mockUpdateStudyQuestionOrder = vi.fn()
  const mockRouterPush = vi.fn()
  const mockEnqueueSnackbar = vi.fn()
  const mockRefetch = vi.fn()

  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks()

    // Mock router.push
    vi.mocked(useRouter as unknown as Mock).mockImplementation(() => ({
      push: mockRouterPush
    }))

    // Mock useMutation
    vi.mocked(useMutation as unknown as Mock).mockReturnValue([
      mockUpdateStudyQuestionOrder,
      { loading: false }
    ])

    // Mock useSnackbar
    vi.mocked(useSnackbar as unknown as Mock).mockImplementation(() => ({
      enqueueSnackbar: mockEnqueueSnackbar
    }))

    // Mock useQuery with study questions data
    vi.mocked(useQuery as unknown as Mock).mockReturnValue({
      data: {
        adminVideo: {
          id: mockVideoId,
          studyQuestions: [
            { id: 'q1', value: 'First question?', order: 1 },
            { id: 'q2', value: 'Second question?', order: 2 },
            { id: 'q3', value: 'Third question?', order: 3 }
          ]
        }
      },
      loading: false,
      refetch: mockRefetch
    })
  })

  it('renders the study questions list with all questions', () => {
    render(<StudyQuestionsList />)

    // Check section title
    expect(screen.getByTestId('section-title')).toHaveTextContent(
      'Study Questions'
    )

    // Check that all questions are rendered
    expect(screen.getByTestId('mock-ordered-list')).toHaveAttribute(
      'data-items-count',
      '3'
    )
    expect(screen.getByTestId('mock-ordered-item-q1')).toBeInTheDocument()
    expect(screen.getByTestId('mock-ordered-item-q2')).toBeInTheDocument()
    expect(screen.getByTestId('mock-ordered-item-q3')).toBeInTheDocument()

    // Check question content
    expect(screen.getByTestId('item-label-q1')).toHaveTextContent(
      'First question?'
    )
    expect(screen.getByTestId('item-label-q2')).toHaveTextContent(
      'Second question?'
    )
    expect(screen.getByTestId('item-label-q3')).toHaveTextContent(
      'Third question?'
    )

    // Check add button
    expect(screen.getByTestId('mock-button')).toHaveTextContent('Add')
  })

  it('displays a fallback when there are no study questions', () => {
    // Mock useQuery with empty study questions
    vi.mocked(useQuery as unknown as Mock).mockReturnValue({
      data: {
        adminVideo: {
          id: mockVideoId,
          studyQuestions: []
        }
      },
      loading: false,
      refetch: mockRefetch
    })

    render(<StudyQuestionsList />)

    // Check fallback message
    expect(screen.getByTestId('section-fallback')).toHaveTextContent(
      'No study questions'
    )

    // Check add button still exists
    expect(screen.getByTestId('mock-button')).toHaveTextContent('Add')
  })

  it('navigates to add study question page when add button is clicked', () => {
    render(<StudyQuestionsList />)

    // Click add button
    fireEvent.click(screen.getByTestId('mock-button'))

    // Check if router.push was called with the correct path
    expect(mockRouterPush).toHaveBeenCalledWith(
      `/videos/${mockVideoId}/studyQuestion/add`,
      { scroll: false }
    )
  })

  it('navigates to edit study question page when edit button is clicked', () => {
    render(<StudyQuestionsList />)

    // Click edit button for the first question
    fireEvent.click(screen.getByTestId('edit-button-q1'))

    // Check if router.push was called with the correct path
    expect(mockRouterPush).toHaveBeenCalledWith(
      `/videos/${mockVideoId}/studyQuestion/q1`,
      { scroll: false }
    )
  })

  it('navigates to delete study question page when delete button is clicked', () => {
    render(<StudyQuestionsList />)

    // Click delete button for the second question
    fireEvent.click(screen.getByTestId('delete-button-q2'))

    // Check if router.push was called with the correct path
    expect(mockRouterPush).toHaveBeenCalledWith(
      `/videos/${mockVideoId}/studyQuestion/q2/delete`,
      { scroll: false }
    )
  })
})
