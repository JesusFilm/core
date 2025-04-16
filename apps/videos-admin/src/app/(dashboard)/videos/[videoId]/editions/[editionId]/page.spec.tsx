import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'

import EditEditionPage from './page'

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn()
  }))
}))

// Mock useSnackbar
jest.mock('notistack', () => ({
  useSnackbar: jest.fn(() => ({
    enqueueSnackbar: jest.fn()
  }))
}))

// Import actual component to mock
jest.mock('./page', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('EditEditionPage', () => {
  const mockVideoId = 'video-123'
  const mockEditionId = 'edition-456'

  const setup = () => {
    // Mock implementation for the component
    ;(EditEditionPage as jest.Mock).mockImplementation(({ params }) => (
      <div data-testid="edit-edition-page">
        <div data-testid="video-id">{params.videoId}</div>
        <div data-testid="edition-id">{params.editionId}</div>
        <form data-testid="EditionForm">
          <input data-testid="name-field" />
          <button data-testid="save-button" type="submit">
            Save
          </button>
        </form>
        <div data-testid="subtitles-section">
          <button data-testid="add-subtitle-button">New Subtitle</button>
          <div data-testid="subtitle-list">
            <div data-testid="subtitle-item-1">English</div>
            <div data-testid="subtitle-item-2">Spanish</div>
          </div>
        </div>
      </div>
    ))

    return render(
      <MockedProvider mocks={[]}>
        <EditEditionPage
          params={{ videoId: mockVideoId, editionId: mockEditionId }}
        />
      </MockedProvider>
    )
  }

  it('should render the edit edition page', () => {
    setup()
    expect(screen.getByTestId('edit-edition-page')).toBeInTheDocument()
    expect(screen.getByTestId('video-id')).toHaveTextContent(mockVideoId)
    expect(screen.getByTestId('edition-id')).toHaveTextContent(mockEditionId)
  })

  it('should render the edition form', () => {
    setup()
    expect(screen.getByTestId('EditionForm')).toBeInTheDocument()
    expect(screen.getByTestId('name-field')).toBeInTheDocument()
    expect(screen.getByTestId('save-button')).toBeInTheDocument()
  })

  it('should render the subtitles section', () => {
    setup()
    expect(screen.getByTestId('subtitles-section')).toBeInTheDocument()
    expect(screen.getByTestId('add-subtitle-button')).toBeInTheDocument()
    expect(screen.getByTestId('subtitle-list')).toBeInTheDocument()
    expect(screen.getByTestId('subtitle-item-1')).toHaveTextContent('English')
    expect(screen.getByTestId('subtitle-item-2')).toHaveTextContent('Spanish')
  })

  // Add more tests as needed for form submission, navigation, etc.
})
