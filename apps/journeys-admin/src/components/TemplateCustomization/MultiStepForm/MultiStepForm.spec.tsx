import { render, screen, fireEvent, waitFor } from '@testing-library/react'

import { MultiStepForm } from './MultiStepForm'
import { JourneyFields as Journey } from '../../../../__generated__/JourneyFields'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { journey } from '@core/journeys/ui/JourneyProvider/JourneyProvider.mock'
import { MessagePlatform } from '../../../../__generated__/globalTypes'

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
  SocialScreen: ({ handleNext }: { handleNext: () => void }) => (
    <div data-testid="social-screen">
      <h2>Social Screen</h2>
      <button onClick={handleNext} data-testid="social-next">
        Next
      </button>
    </div>
  ),
  DoneScreen: ({
    handleScreenNavigation
  }: {
    handleScreenNavigation: (screen: string) => void
  }) => (
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

  it('should render screens with journey that has all customization capabilities', async () => {
    const journeyWithAllCapabilities = {
      ...journey,
      journeyCustomizationDescription: 'Hello {{ firstName: John }}!',
      journeyCustomizationFields: [
        {
          id: '1',
          key: 'firstName',
          value: 'John',
          __typename: 'JourneyCustomizationField'
        }
      ],
      chatButtons: [
        {
          id: 'chat-1',
          platform: MessagePlatform.whatsApp,
          link: 'https://wa.me/123'
        }
      ],
      blocks: []
    } as unknown as Journey

    render(
      <JourneyProvider value={{ journey: journeyWithAllCapabilities }}>
        <MultiStepForm />
      </JourneyProvider>
    )
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

    // SocialScreen + DoneScreen
    expect(screen.getByTestId('progress-stepper-step-3')).toBeInTheDocument()
    expect(screen.getByTestId('social-screen')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('social-next'))
  })

  it('should hide edit manually button when on the first screen (Language Screen)', () => {
    const journey = {
      id: 'test-journey-id'
    } as unknown as Journey

    render(
      <JourneyProvider value={{ journey }}>
        <MultiStepForm />
      </JourneyProvider>
    )

    const editButton = screen.getByText('Edit Manually')
    expect(editButton).toHaveStyle('visibility: hidden')
  })

  it('should show edit manually button when on any screen after the first screen', () => {
    const journey = {
      id: 'test-journey-id'
    } as unknown as Journey

    render(
      <JourneyProvider value={{ journey: journey }}>
        <MultiStepForm />
      </JourneyProvider>
    )

    const editButton = screen.getByText('Edit Manually')
    expect(editButton).toHaveStyle('visibility: hidden')

    fireEvent.click(screen.getByTestId('language-next'))
    expect(editButton).toHaveStyle('visibility: visible')
    expect(editButton).toHaveAttribute('href', '/journeys/test-journey-id')
  })

  it('should disable edit manually button if journey is not found', () => {
    const journey = {
      id: null
    } as unknown as Journey

    render(
      <JourneyProvider value={{ journey }}>
        <MultiStepForm />
      </JourneyProvider>
    )
    expect(screen.getByText('Edit Manually')).toHaveAttribute(
      'aria-disabled',
      'true'
    )
  })

  it('should render only language, social, and done screens when journey has no customization capabilities', async () => {
    const journeyWithNoCapabilities = {
      ...journey,
      journeyCustomizationDescription: null,
      journeyCustomizationFields: [],
      chatButtons: [],
      blocks: []
    } as unknown as Journey

    render(
      <JourneyProvider value={{ journey: journeyWithNoCapabilities }}>
        <MultiStepForm />
      </JourneyProvider>
    )
    expect(screen.getByTestId('MultiStepForm')).toBeInTheDocument()

    // LanguageScreen
    expect(screen.getByTestId('language-screen')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('language-next'))

    // SocialScreen + DoneScreen (should skip text and links)
    expect(screen.getByTestId('social-screen')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('social-next'))

    // Text and Links screens should not be present
    expect(screen.queryByTestId('text-screen')).not.toBeInTheDocument()
    expect(screen.queryByTestId('links-screen')).not.toBeInTheDocument()
  })

  it('should not render progress stepper when journey has no customization capabilities', async () => {
    const journeyWithNoCapabilities = {
      ...journey,
      journeyCustomizationDescription: null,
      journeyCustomizationFields: [],
      chatButtons: [],
      blocks: []
    } as unknown as Journey

    render(
      <JourneyProvider value={{ journey: journeyWithNoCapabilities }}>
        <MultiStepForm />
      </JourneyProvider>
    )
    expect(screen.getByTestId('MultiStepForm')).toBeInTheDocument()
    expect(
      screen.queryByTestId('progress-stepper-step-0')
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('progress-stepper-step-1')
    ).not.toBeInTheDocument()
  })

  it('should render only text screen when journey has editable text but no links', async () => {
    const journeyWithTextOnly = {
      ...journey,
      journeyCustomizationDescription: 'Hello {{ firstName: John }}!',
      journeyCustomizationFields: [
        {
          id: '1',
          key: 'firstName',
          value: 'John',
          __typename: 'JourneyCustomizationField'
        }
      ],
      chatButtons: [],
      blocks: []
    } as unknown as Journey

    render(
      <JourneyProvider value={{ journey: journeyWithTextOnly }}>
        <MultiStepForm />
      </JourneyProvider>
    )
    expect(screen.getByTestId('MultiStepForm')).toBeInTheDocument()

    // LanguageScreen
    expect(screen.getByTestId('language-screen')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('language-next'))

    // TextScreen
    expect(screen.getByTestId('text-screen')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('text-next'))

    // SocialScreen
    expect(screen.getByTestId('social-screen')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('social-next'))

    // DoneScreen
    expect(screen.getByTestId('done-screen')).toBeInTheDocument()

    // Links screen should not be present
    expect(screen.queryByTestId('links-screen')).not.toBeInTheDocument()
  })

  it('should render only links screen when journey has customizable links but no editable text', async () => {
    const journeyWithLinksOnly = {
      ...journey,
      journeyCustomizationDescription: null,
      journeyCustomizationFields: [],
      chatButtons: [
        {
          id: 'chat-1',
          platform: MessagePlatform.whatsApp,
          link: 'https://wa.me/123'
        }
      ],
      blocks: []
    } as unknown as Journey

    render(
      <JourneyProvider value={{ journey: journeyWithLinksOnly }}>
        <MultiStepForm />
      </JourneyProvider>
    )
    expect(screen.getByTestId('MultiStepForm')).toBeInTheDocument()

    // LanguageScreen
    expect(screen.getByTestId('language-screen')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('language-next'))

    // LinksScreen
    expect(screen.getByTestId('links-screen')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('links-next'))

    // SocialScreen
    expect(screen.getByTestId('social-screen')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('social-next'))

    // DoneScreen
    expect(screen.getByTestId('done-screen')).toBeInTheDocument()

    // Text screen should not be present
    expect(screen.queryByTestId('text-screen')).not.toBeInTheDocument()
  })
})
