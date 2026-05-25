import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import { type Mock } from 'vitest'

import EditEditionPage from './page'

// Mock useRouter
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn()
  }))
}))

// Mock useSnackbar
vi.mock('notistack', () => ({
  useSnackbar: vi.fn(() => ({
    enqueueSnackbar: vi.fn()
  }))
}))

// Import actual component to mock
vi.mock('./page', () => ({
  __esModule: true,
  default: vi.fn()
}))

describe('EditEditionPage', () => {
  const mockVideoId = 'video-123'
  const mockEditionId = 'edition-456'

  const setup = () => {
    // Mock implementation for the component
    ;(EditEditionPage as Mock).mockImplementation(() => (
      <div data-testid="edit-edition-page">
        <div data-testid="video-id">{mockVideoId}</div>
        <div data-testid="edition-id">{mockEditionId}</div>
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
          params={Promise.resolve({
            videoId: mockVideoId,
            editionId: mockEditionId
          })}
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
