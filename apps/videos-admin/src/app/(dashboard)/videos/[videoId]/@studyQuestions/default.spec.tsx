import { fireEvent, render, screen } from '@testing-library/react'

// Import the component under test
import StudyQuestionsList from './default'

// Mock Apollo client
jest.mock('@apollo/client', () => {
  const original = jest.requireActual('@apollo/client')
  return {
    ...original,
    useMutation: jest.fn(() => [jest.fn(), { loading: false }]),
    useQuery: jest.fn(() => ({
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
      refetch: jest.fn()
    }))
  }
})

// Mock OrderedList component
jest.mock('../../../../../components/OrderedList', () => ({
  OrderedList: ({ children, items }) => (
    <div data-testid="mock-ordered-list" data-items-count={items.length}>
      {children}
    </div>
  )
}))

// Mock OrderedItem component
jest.mock('../../../../../components/OrderedList/OrderedItem', () => ({
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
jest.mock('../../../../../components/Section', () => {
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
jest.mock('@mui/material/Stack', () => ({
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

jest.mock('@mui/material/Button', () => ({
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
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn()
  }),
  usePathname: () => '/videos/video-123/studyQuestions'
}))

// Mock notistack
jest.mock('notistack', () => ({
  useSnackbar: () => ({ enqueueSnackbar: jest.fn() })
}))

describe('StudyQuestionsList', () => {
  const mockVideoId = 'video-123'

  // Mock functions
  const mockUpdateStudyQuestionOrder = jest.fn()
  const mockRouterPush = jest.fn()
  const mockEnqueueSnackbar = jest.fn()
  const mockRefetch = jest.fn()

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks()

    // Mock router.push
    jest
      .spyOn(require('next/navigation'), 'useRouter')
      .mockImplementation(() => ({
        push: mockRouterPush
      }))

    // Mock useMutation
    jest
      .spyOn(require('@apollo/client'), 'useMutation')
      .mockReturnValue([mockUpdateStudyQuestionOrder, { loading: false }])

    // Mock useSnackbar
    jest.spyOn(require('notistack'), 'useSnackbar').mockImplementation(() => ({
      enqueueSnackbar: mockEnqueueSnackbar
    }))

    // Mock useQuery with study questions data
    jest.spyOn(require('@apollo/client'), 'useQuery').mockReturnValue({
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
    render(
      <StudyQuestionsList
        params={{
          videoId: mockVideoId
        }}
      />
    )

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
    jest.spyOn(require('@apollo/client'), 'useQuery').mockReturnValue({
      data: {
        adminVideo: {
          id: mockVideoId,
          studyQuestions: []
        }
      },
      loading: false,
      refetch: mockRefetch
    })

    render(
      <StudyQuestionsList
        params={{
          videoId: mockVideoId
        }}
      />
    )

    // Check fallback message
    expect(screen.getByTestId('section-fallback')).toHaveTextContent(
      'No study questions'
    )

    // Check add button still exists
    expect(screen.getByTestId('mock-button')).toHaveTextContent('Add')
  })

  it('navigates to add study question page when add button is clicked', () => {
    render(
      <StudyQuestionsList
        params={{
          videoId: mockVideoId
        }}
      />
    )

    // Click add button
    fireEvent.click(screen.getByTestId('mock-button'))

    // Check if router.push was called with the correct path
    expect(mockRouterPush).toHaveBeenCalledWith(
      `/videos/${mockVideoId}/studyQuestion/add`,
      { scroll: false }
    )
  })

  it('navigates to edit study question page when edit button is clicked', () => {
    render(
      <StudyQuestionsList
        params={{
          videoId: mockVideoId
        }}
      />
    )

    // Click edit button for the first question
    fireEvent.click(screen.getByTestId('edit-button-q1'))

    // Check if router.push was called with the correct path
    expect(mockRouterPush).toHaveBeenCalledWith(
      `/videos/${mockVideoId}/studyQuestion/q1`,
      { scroll: false }
    )
  })

  it('navigates to delete study question page when delete button is clicked', () => {
    render(
      <StudyQuestionsList
        params={{
          videoId: mockVideoId
        }}
      />
    )

    // Click delete button for the second question
    fireEvent.click(screen.getByTestId('delete-button-q2'))

    // Check if router.push was called with the correct path
    expect(mockRouterPush).toHaveBeenCalledWith(
      `/videos/${mockVideoId}/studyQuestion/q2/delete`,
      { scroll: false }
    )
  })
})
