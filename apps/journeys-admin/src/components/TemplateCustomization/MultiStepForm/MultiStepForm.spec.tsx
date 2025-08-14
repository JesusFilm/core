import { render, screen, fireEvent } from '@testing-library/react'

import { MultiStepForm } from './MultiStepForm'

// Mock complex dependencies that the screens use
jest.mock('next-firebase-auth', () => ({
  useUser: () => ({ id: 'test-user-id' })
}))

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    query: {}
  })
}))

// Mock the screen components to avoid complex dependencies
jest.mock('./Screens', () => ({
  LanguageScreen: ({ handleNext }: { handleNext: () => void }) => (
    <div data-testid="language-screen">
      <h2>Language Screen</h2>
      <button onClick={handleNext} data-testid="language-next">
        Next
      </button>
    </div>
  ),
  TextScreen: ({ handleNext }: { handleNext: () => void }) => (
    <div data-testid="text-screen">
      <h2>Text Screen</h2>
      <button onClick={handleNext} data-testid="text-next">
        Next
      </button>
    </div>
  ),
  LinksScreen: ({ handleNext }: { handleNext: () => void }) => (
    <div data-testid="links-screen">
      <h2>Links Screen</h2>
      <button onClick={handleNext} data-testid="links-next">
        Next
      </button>
    </div>
  ),
  DoneScreen: () => (
    <div data-testid="done-screen">
      <h2>Done Screen</h2>
    </div>
  )
}))

describe('MultiStepForm', () => {
  beforeEach(() => {
    // Reset URL mock to default state
    Object.defineProperty(window, 'location', {
      value: { search: '' },
      writable: true
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render screens', () => {
    render(<MultiStepForm />)
    expect(screen.getByTestId('MultiStepForm')).toBeInTheDocument()

    // LanguageScreen
    expect(screen.getByTestId('progress-stepper-step-0')).toBeInTheDocument()
    expect(screen.getByTestId('language-screen')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('language-next'))

    // TextScreen
    expect(screen.getByTestId('progress-stepper-step-1')).toBeInTheDocument()
    expect(screen.getByTestId('text-screen')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('text-next'))

    // LinksScreen
    expect(screen.getByTestId('progress-stepper-step-2')).toBeInTheDocument()
    expect(screen.getByTestId('links-screen')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('links-next'))

    // DoneScreen
    expect(screen.getByTestId('progress-stepper-step-3')).toBeInTheDocument()
    expect(screen.getByTestId('done-screen')).toBeInTheDocument()
  })
})
