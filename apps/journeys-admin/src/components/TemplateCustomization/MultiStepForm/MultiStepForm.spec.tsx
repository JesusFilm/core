import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import React from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { journey } from '@core/journeys/ui/JourneyProvider/JourneyProvider.mock'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'

import { JourneyFields as Journey } from '../../../../__generated__/JourneyFields'

import { MultiStepForm } from './MultiStepForm'

// Mock complex dependencies that the screens use (user is null when unauthenticated)
const defaultAuth = {
  user: {
    id: 'test-user-id',
    email: null,
    displayName: null,
    photoURL: null,
    phoneNumber: null,
    emailVerified: false,
    token: 'mock-token'
  }
}
const guestAuth = { user: null }
const mockUseAuth = jest.fn(() => defaultAuth)
jest.mock('../../../libs/auth', () => ({
  useAuth: (...args: unknown[]) => mockUseAuth(...args)
}))

const defaultFlags = {
  templateCustomizationGuestFlow: false,
  customizableMedia: false
}

jest.mock('./TemplateVideoUploadProvider', () => ({
  TemplateVideoUploadProvider: ({
    children
  }: {
    children: React.ReactNode
  }) => <>{children}</>
}))

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    query: {}
  })
}))

const mockPush = jest.fn()
const mockReplace = jest.fn()
jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
    replace: mockReplace,
    query: { journeyId: 'journeyId' },
    isReady: false
  }))
}))
const mockUseRouter = jest.requireMock('next/router').useRouter as jest.Mock

function setRouterQuery(
  query: Record<string, string>,
  options?: { isReady?: boolean }
): void {
  mockUseRouter.mockReturnValue({
    push: mockPush,
    replace: mockReplace,
    query,
    isReady: options?.isReady ?? false
  })
}

// Mock the screen components to avoid complex dependencies
jest.mock('./Screens', () => ({
  LanguageScreen: ({
    handleNext
  }: {
    handleNext: (overrideJourneyId?: string) => void
  }) => (
    <div data-testid="language-screen">
      <h2>Language Screen</h2>
      <button onClick={() => handleNext()} data-testid="language-next">
        Next
      </button>
      <button
        onClick={() => handleNext('override-journey-id')}
        data-testid="language-next-with-override"
      >
        Next with override
      </button>
    </div>
  ),
  TextScreen: ({
    handleNext
  }: {
    handleNext: (overrideJourneyId?: string) => void
  }) => (
    <div data-testid="text-screen">
      <h2>Text Screen</h2>
      <button onClick={() => handleNext()} data-testid="text-next">
        Next
      </button>
    </div>
  ),
  LinksScreen: ({
    handleNext
  }: {
    handleNext: (overrideJourneyId?: string) => void
  }) => (
    <div data-testid="links-screen">
      <h2>Links Screen</h2>
      <button onClick={() => handleNext()} data-testid="links-next">
        Next
      </button>
    </div>
  ),
  MediaScreen: ({
    handleNext
  }: {
    handleNext: (overrideJourneyId?: string) => void
  }) => (
    <div data-testid="media-screen">
      <h2>Media Screen</h2>
      <button onClick={() => handleNext()} data-testid="media-next">
        Next
      </button>
    </div>
  ),
  SocialScreen: ({
    handleNext
  }: {
    handleNext: (overrideJourneyId?: string) => void
  }) => (
    <div data-testid="social-screen">
      <h2>Social Screen</h2>
      <button onClick={() => handleNext()} data-testid="social-next">
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
      <button
        onClick={() => handleScreenNavigation('language')}
        data-testid="done-screen-go-to-language"
      >
        Go to language
      </button>
    </div>
  )
}))

function renderMultiStepForm(
  journeyData: Journey,
  options: { customizableMedia?: boolean } = {}
): ReturnType<typeof render> {
  const { customizableMedia = false } = options
  return render(
    <FlagsProvider flags={{ ...defaultFlags, customizableMedia }}>
      <JourneyProvider value={{ journey: journeyData }}>
        <MultiStepForm />
      </JourneyProvider>
    </FlagsProvider>
  )
}

describe('MultiStepForm', () => {
  afterEach(() => {
    jest.clearAllMocks()
    mockUseAuth.mockImplementation(() => defaultAuth)
  })

  describe('rendering and controls', () => {
    describe('screen flow', () => {
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
          blocks: [
            {
              __typename: 'ButtonBlock',
              id: '1',
              label: 'Test Button',
              action: {
                __typename: 'LinkAction',
                url: 'https://wa.me/123',
                customizable: true,
                parentStepId: null
              }
            }
          ]
        } as unknown as Journey

        const journeyId = journeyWithAllCapabilities.id
        setRouterQuery({ journeyId })

        const { rerender } = render(
          <FlagsProvider flags={defaultFlags}>
            <SnackbarProvider>
              <JourneyProvider value={{ journey: journeyWithAllCapabilities }}>
                <MultiStepForm />
              </JourneyProvider>
            </SnackbarProvider>
          </FlagsProvider>
        )
        expect(screen.getByTestId('MultiStepForm')).toBeInTheDocument()

        // LanguageScreen
        expect(
          screen.getByTestId('progress-stepper-step-0')
        ).toBeInTheDocument()
        expect(screen.getByTestId('language-screen')).toBeInTheDocument()
        fireEvent.click(screen.getByTestId('language-next'))
        setRouterQuery({ journeyId, screen: 'text' })
        rerender(
          <FlagsProvider flags={defaultFlags}>
            <SnackbarProvider>
              <JourneyProvider value={{ journey: journeyWithAllCapabilities }}>
                <MultiStepForm />
              </JourneyProvider>
            </SnackbarProvider>
          </FlagsProvider>
        )

        // TextScreen
        expect(
          screen.getByTestId('progress-stepper-step-1')
        ).toBeInTheDocument()
        expect(screen.getByTestId('text-screen')).toBeInTheDocument()
        fireEvent.click(screen.getByTestId('text-next'))
        setRouterQuery({ journeyId, screen: 'links' })
        rerender(
          <FlagsProvider flags={defaultFlags}>
            <SnackbarProvider>
              <JourneyProvider value={{ journey: journeyWithAllCapabilities }}>
                <MultiStepForm />
              </JourneyProvider>
            </SnackbarProvider>
          </FlagsProvider>
        )

        // LinksScreen
        expect(
          screen.getByTestId('progress-stepper-step-2')
        ).toBeInTheDocument()
        expect(screen.getByTestId('links-screen')).toBeInTheDocument()
        fireEvent.click(screen.getByTestId('links-next'))
        setRouterQuery({ journeyId, screen: 'social' })
        rerender(
          <FlagsProvider flags={defaultFlags}>
            <SnackbarProvider>
              <JourneyProvider value={{ journey: journeyWithAllCapabilities }}>
                <MultiStepForm />
              </JourneyProvider>
            </SnackbarProvider>
          </FlagsProvider>
        )

        // SocialScreen + DoneScreen
        expect(
          screen.getByTestId('progress-stepper-step-3')
        ).toBeInTheDocument()
        expect(screen.getByTestId('social-screen')).toBeInTheDocument()
        fireEvent.click(screen.getByTestId('social-next'))
      })

      it('should render only language, social, and done screens when journey has no customization capabilities', async () => {
        const journeyWithNoCapabilities = {
          ...journey,
          journeyCustomizationDescription: null,
          journeyCustomizationFields: [],
          chatButtons: [],
          blocks: []
        } as unknown as Journey

        const journeyId = journeyWithNoCapabilities.id
        setRouterQuery({ journeyId })

        const { rerender } = render(
          <FlagsProvider flags={defaultFlags}>
            <SnackbarProvider>
              <JourneyProvider value={{ journey: journeyWithNoCapabilities }}>
                <MultiStepForm />
              </JourneyProvider>
            </SnackbarProvider>
          </FlagsProvider>
        )
        expect(screen.getByTestId('MultiStepForm')).toBeInTheDocument()

        // LanguageScreen
        expect(screen.getByTestId('language-screen')).toBeInTheDocument()
        fireEvent.click(screen.getByTestId('language-next'))
        setRouterQuery({ journeyId, screen: 'social' })
        rerender(
          <FlagsProvider flags={defaultFlags}>
            <SnackbarProvider>
              <JourneyProvider value={{ journey: journeyWithNoCapabilities }}>
                <MultiStepForm />
              </JourneyProvider>
            </SnackbarProvider>
          </FlagsProvider>
        )

        // SocialScreen + DoneScreen (should skip text and links)
        expect(screen.getByTestId('social-screen')).toBeInTheDocument()
        fireEvent.click(screen.getByTestId('social-next'))

        // Text and Links screens should not be present
        expect(screen.queryByTestId('text-screen')).not.toBeInTheDocument()
        expect(screen.queryByTestId('links-screen')).not.toBeInTheDocument()
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

        const journeyId = journeyWithTextOnly.id
        setRouterQuery({ journeyId })

        const { rerender } = render(
          <FlagsProvider flags={defaultFlags}>
            <SnackbarProvider>
              <JourneyProvider value={{ journey: journeyWithTextOnly }}>
                <MultiStepForm />
              </JourneyProvider>
            </SnackbarProvider>
          </FlagsProvider>
        )
        expect(screen.getByTestId('MultiStepForm')).toBeInTheDocument()

        // LanguageScreen
        expect(screen.getByTestId('language-screen')).toBeInTheDocument()
        fireEvent.click(screen.getByTestId('language-next'))
        setRouterQuery({ journeyId, screen: 'text' })
        rerender(
          <FlagsProvider flags={defaultFlags}>
            <SnackbarProvider>
              <JourneyProvider value={{ journey: journeyWithTextOnly }}>
                <MultiStepForm />
              </JourneyProvider>
            </SnackbarProvider>
          </FlagsProvider>
        )

        // TextScreen
        expect(screen.getByTestId('text-screen')).toBeInTheDocument()
        fireEvent.click(screen.getByTestId('text-next'))
        setRouterQuery({ journeyId, screen: 'social' })
        rerender(
          <FlagsProvider flags={defaultFlags}>
            <SnackbarProvider>
              <JourneyProvider value={{ journey: journeyWithTextOnly }}>
                <MultiStepForm />
              </JourneyProvider>
            </SnackbarProvider>
          </FlagsProvider>
        )

        // SocialScreen
        expect(screen.getByTestId('social-screen')).toBeInTheDocument()
        fireEvent.click(screen.getByTestId('social-next'))
        setRouterQuery({ journeyId, screen: 'done' })
        rerender(
          <FlagsProvider flags={defaultFlags}>
            <SnackbarProvider>
              <JourneyProvider value={{ journey: journeyWithTextOnly }}>
                <MultiStepForm />
              </JourneyProvider>
            </SnackbarProvider>
          </FlagsProvider>
        )

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
          blocks: [
            {
              __typename: 'ButtonBlock',
              id: '1',
              label: 'Test Button',
              action: {
                __typename: 'EmailAction',
                email: 'test@example.com',
                customizable: true,
                parentStepId: null
              }
            }
          ]
        } as unknown as Journey

        const journeyId = journeyWithLinksOnly.id
        setRouterQuery({ journeyId })

        const { rerender } = render(
          <FlagsProvider flags={defaultFlags}>
            <SnackbarProvider>
              <JourneyProvider value={{ journey: journeyWithLinksOnly }}>
                <MultiStepForm />
              </JourneyProvider>
            </SnackbarProvider>
          </FlagsProvider>
        )
        expect(screen.getByTestId('MultiStepForm')).toBeInTheDocument()

        // LanguageScreen
        expect(screen.getByTestId('language-screen')).toBeInTheDocument()
        fireEvent.click(screen.getByTestId('language-next'))
        setRouterQuery({ journeyId, screen: 'links' })
        rerender(
          <FlagsProvider flags={defaultFlags}>
            <SnackbarProvider>
              <JourneyProvider value={{ journey: journeyWithLinksOnly }}>
                <MultiStepForm />
              </JourneyProvider>
            </SnackbarProvider>
          </FlagsProvider>
        )

        // LinksScreen
        expect(screen.getByTestId('links-screen')).toBeInTheDocument()
        fireEvent.click(screen.getByTestId('links-next'))
        setRouterQuery({ journeyId, screen: 'social' })
        rerender(
          <FlagsProvider flags={defaultFlags}>
            <SnackbarProvider>
              <JourneyProvider value={{ journey: journeyWithLinksOnly }}>
                <MultiStepForm />
              </JourneyProvider>
            </SnackbarProvider>
          </FlagsProvider>
        )

        // SocialScreen
        expect(screen.getByTestId('social-screen')).toBeInTheDocument()
        fireEvent.click(screen.getByTestId('social-next'))
        setRouterQuery({ journeyId, screen: 'done' })
        rerender(
          <FlagsProvider flags={defaultFlags}>
            <SnackbarProvider>
              <JourneyProvider value={{ journey: journeyWithLinksOnly }}>
                <MultiStepForm />
              </JourneyProvider>
            </SnackbarProvider>
          </FlagsProvider>
        )

        // DoneScreen
        expect(screen.getByTestId('done-screen')).toBeInTheDocument()

        // Text screen should not be present
        expect(screen.queryByTestId('text-screen')).not.toBeInTheDocument()
      })

      it('should render all screens including media when customizableMedia flag is true', async () => {
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
          blocks: [
            {
              __typename: 'ButtonBlock',
              id: '1',
              label: 'Test Button',
              action: {
                __typename: 'LinkAction',
                url: 'https://wa.me/123',
                customizable: true,
                parentStepId: null
              }
            },
            {
              __typename: 'ImageBlock',
              id: '1',
              customizable: true
            }
          ]
        } as unknown as Journey

        const journeyId = journeyWithAllCapabilities.id
        setRouterQuery({ journeyId })

        const { rerender } = render(
          <FlagsProvider flags={{ ...defaultFlags, customizableMedia: true }}>
            <SnackbarProvider>
              <JourneyProvider value={{ journey: journeyWithAllCapabilities }}>
                <MultiStepForm />
              </JourneyProvider>
            </SnackbarProvider>
          </FlagsProvider>
        )
        expect(screen.getByTestId('MultiStepForm')).toBeInTheDocument()

        expect(
          screen.getByTestId('progress-stepper-step-0')
        ).toBeInTheDocument()
        expect(screen.getByTestId('language-screen')).toBeInTheDocument()
        fireEvent.click(screen.getByTestId('language-next'))
        setRouterQuery({ journeyId, screen: 'text' })
        rerender(
          <FlagsProvider flags={{ ...defaultFlags, customizableMedia: true }}>
            <SnackbarProvider>
              <JourneyProvider value={{ journey: journeyWithAllCapabilities }}>
                <MultiStepForm />
              </JourneyProvider>
            </SnackbarProvider>
          </FlagsProvider>
        )

        expect(
          screen.getByTestId('progress-stepper-step-1')
        ).toBeInTheDocument()
        expect(screen.getByTestId('text-screen')).toBeInTheDocument()
        fireEvent.click(screen.getByTestId('text-next'))
        setRouterQuery({ journeyId, screen: 'links' })
        rerender(
          <FlagsProvider flags={{ ...defaultFlags, customizableMedia: true }}>
            <SnackbarProvider>
              <JourneyProvider value={{ journey: journeyWithAllCapabilities }}>
                <MultiStepForm />
              </JourneyProvider>
            </SnackbarProvider>
          </FlagsProvider>
        )

        expect(
          screen.getByTestId('progress-stepper-step-2')
        ).toBeInTheDocument()
        expect(screen.getByTestId('links-screen')).toBeInTheDocument()
        fireEvent.click(screen.getByTestId('links-next'))
        setRouterQuery({ journeyId, screen: 'media' })
        rerender(
          <FlagsProvider flags={{ ...defaultFlags, customizableMedia: true }}>
            <SnackbarProvider>
              <JourneyProvider value={{ journey: journeyWithAllCapabilities }}>
                <MultiStepForm />
              </JourneyProvider>
            </SnackbarProvider>
          </FlagsProvider>
        )

        expect(
          screen.getByTestId('progress-stepper-step-3')
        ).toBeInTheDocument()
        expect(screen.getByTestId('media-screen')).toBeInTheDocument()
        fireEvent.click(screen.getByTestId('media-next'))
        setRouterQuery({ journeyId, screen: 'social' })
        rerender(
          <FlagsProvider flags={{ ...defaultFlags, customizableMedia: true }}>
            <SnackbarProvider>
              <JourneyProvider value={{ journey: journeyWithAllCapabilities }}>
                <MultiStepForm />
              </JourneyProvider>
            </SnackbarProvider>
          </FlagsProvider>
        )

        expect(
          screen.getByTestId('progress-stepper-step-4')
        ).toBeInTheDocument()
        expect(screen.getByTestId('social-screen')).toBeInTheDocument()
        fireEvent.click(screen.getByTestId('social-next'))
        setRouterQuery({ journeyId, screen: 'done' })
        rerender(
          <FlagsProvider flags={{ ...defaultFlags, customizableMedia: true }}>
            <SnackbarProvider>
              <JourneyProvider value={{ journey: journeyWithAllCapabilities }}>
                <MultiStepForm />
              </JourneyProvider>
            </SnackbarProvider>
          </FlagsProvider>
        )

        expect(screen.getByTestId('done-screen')).toBeInTheDocument()
      })

      it('should skip media screen when customizableMedia flag is false', async () => {
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
          blocks: [
            {
              __typename: 'ButtonBlock',
              id: '1',
              label: 'Test Button',
              action: {
                __typename: 'LinkAction',
                url: 'https://wa.me/123',
                customizable: true,
                parentStepId: null
              }
            },
            {
              __typename: 'ImageBlock',
              id: '1',
              customizable: true
            }
          ]
        } as unknown as Journey

        const journeyId = journeyWithAllCapabilities.id
        setRouterQuery({ journeyId })

        const { rerender } = render(
          <FlagsProvider flags={{ ...defaultFlags, customizableMedia: false }}>
            <SnackbarProvider>
              <JourneyProvider value={{ journey: journeyWithAllCapabilities }}>
                <MultiStepForm />
              </JourneyProvider>
            </SnackbarProvider>
          </FlagsProvider>
        )

        expect(screen.getByTestId('language-screen')).toBeInTheDocument()
        fireEvent.click(screen.getByTestId('language-next'))
        setRouterQuery({ journeyId, screen: 'text' })
        rerender(
          <FlagsProvider flags={{ ...defaultFlags, customizableMedia: false }}>
            <SnackbarProvider>
              <JourneyProvider value={{ journey: journeyWithAllCapabilities }}>
                <MultiStepForm />
              </JourneyProvider>
            </SnackbarProvider>
          </FlagsProvider>
        )

        expect(screen.getByTestId('text-screen')).toBeInTheDocument()
        fireEvent.click(screen.getByTestId('text-next'))
        setRouterQuery({ journeyId, screen: 'links' })
        rerender(
          <FlagsProvider flags={{ ...defaultFlags, customizableMedia: false }}>
            <SnackbarProvider>
              <JourneyProvider value={{ journey: journeyWithAllCapabilities }}>
                <MultiStepForm />
              </JourneyProvider>
            </SnackbarProvider>
          </FlagsProvider>
        )

        expect(screen.getByTestId('links-screen')).toBeInTheDocument()
        fireEvent.click(screen.getByTestId('links-next'))
        setRouterQuery({ journeyId, screen: 'social' })
        rerender(
          <FlagsProvider flags={{ ...defaultFlags, customizableMedia: false }}>
            <SnackbarProvider>
              <JourneyProvider value={{ journey: journeyWithAllCapabilities }}>
                <MultiStepForm />
              </JourneyProvider>
            </SnackbarProvider>
          </FlagsProvider>
        )

        expect(screen.getByTestId('social-screen')).toBeInTheDocument()
        expect(screen.queryByTestId('media-screen')).not.toBeInTheDocument()
      })

      it('should render only media screen when journey has customizable media but no editable text or links', async () => {
        const journeyWithMediaOnly = {
          ...journey,
          journeyCustomizationDescription: null,
          journeyCustomizationFields: [],
          chatButtons: [],
          blocks: [
            {
              __typename: 'ImageBlock',
              id: 'img-1',
              parentBlockId: null,
              parentOrder: 0,
              src: null,
              alt: '',
              width: 0,
              height: 0,
              blurhash: '',
              scale: null,
              focalTop: null,
              focalLeft: null,
              customizable: true
            }
          ]
        } as unknown as Journey

        const journeyId = journeyWithMediaOnly.id
        setRouterQuery({ journeyId })

        const { rerender } = render(
          <FlagsProvider flags={{ ...defaultFlags, customizableMedia: true }}>
            <SnackbarProvider>
              <JourneyProvider value={{ journey: journeyWithMediaOnly }}>
                <MultiStepForm />
              </JourneyProvider>
            </SnackbarProvider>
          </FlagsProvider>
        )
        expect(screen.getByTestId('MultiStepForm')).toBeInTheDocument()

        expect(
          screen.getByTestId('progress-stepper-step-0')
        ).toBeInTheDocument()
        expect(screen.getByTestId('language-screen')).toBeInTheDocument()
        fireEvent.click(screen.getByTestId('language-next'))
        setRouterQuery({ journeyId, screen: 'media' })
        rerender(
          <FlagsProvider flags={{ ...defaultFlags, customizableMedia: true }}>
            <SnackbarProvider>
              <JourneyProvider value={{ journey: journeyWithMediaOnly }}>
                <MultiStepForm />
              </JourneyProvider>
            </SnackbarProvider>
          </FlagsProvider>
        )

        expect(
          screen.getByTestId('progress-stepper-step-1')
        ).toBeInTheDocument()
        expect(screen.getByTestId('media-screen')).toBeInTheDocument()
        fireEvent.click(screen.getByTestId('media-next'))
        setRouterQuery({ journeyId, screen: 'social' })
        rerender(
          <FlagsProvider flags={{ ...defaultFlags, customizableMedia: true }}>
            <SnackbarProvider>
              <JourneyProvider value={{ journey: journeyWithMediaOnly }}>
                <MultiStepForm />
              </JourneyProvider>
            </SnackbarProvider>
          </FlagsProvider>
        )

        expect(
          screen.getByTestId('progress-stepper-step-2')
        ).toBeInTheDocument()
        expect(screen.getByTestId('social-screen')).toBeInTheDocument()
        fireEvent.click(screen.getByTestId('social-next'))
        setRouterQuery({ journeyId, screen: 'done' })
        rerender(
          <FlagsProvider flags={{ ...defaultFlags, customizableMedia: true }}>
            <SnackbarProvider>
              <JourneyProvider value={{ journey: journeyWithMediaOnly }}>
                <MultiStepForm />
              </JourneyProvider>
            </SnackbarProvider>
          </FlagsProvider>
        )

        expect(screen.getByTestId('done-screen')).toBeInTheDocument()

        expect(screen.queryByTestId('text-screen')).not.toBeInTheDocument()
        expect(screen.queryByTestId('links-screen')).not.toBeInTheDocument()
      })
    })

    describe('Edit Manually button', () => {
      it('should hide edit manually button when on the language screen', () => {
        const journey = {
          id: 'test-journey-id'
        } as unknown as Journey

        setRouterQuery({ journeyId: 'test-journey-id' })

        render(
          <FlagsProvider flags={defaultFlags}>
            <SnackbarProvider>
              <JourneyProvider value={{ journey }}>
                <MultiStepForm />
              </JourneyProvider>
            </SnackbarProvider>
          </FlagsProvider>
        )

        const editButton = screen.getByText('Edit Manually')
        expect(editButton).toHaveStyle('visibility: hidden')
      })

      it('should show edit manually button when on any screen after the first screen', () => {
        const journey = {
          id: 'test-journey-id'
        } as unknown as Journey

        setRouterQuery({ journeyId: 'test-journey-id' })

        const { rerender } = render(
          <FlagsProvider flags={defaultFlags}>
            <SnackbarProvider>
              <JourneyProvider value={{ journey: journey }}>
                <MultiStepForm />
              </JourneyProvider>
            </SnackbarProvider>
          </FlagsProvider>
        )

        const editButton = screen.getByText('Edit Manually')
        expect(editButton).toHaveStyle('visibility: hidden')

        fireEvent.click(screen.getByTestId('language-next'))
        setRouterQuery({ journeyId: 'test-journey-id', screen: 'social' })
        rerender(
          <FlagsProvider flags={defaultFlags}>
            <SnackbarProvider>
              <JourneyProvider value={{ journey: journey }}>
                <MultiStepForm />
              </JourneyProvider>
            </SnackbarProvider>
          </FlagsProvider>
        )
        const editButtonAfterRerender = screen.getByText('Edit Manually')
        expect(editButtonAfterRerender).toHaveStyle('visibility: visible')
        expect(editButtonAfterRerender).toHaveAttribute(
          'href',
          '/journeys/test-journey-id'
        )
      })

      it('should disable edit manually button if journey is not found', () => {
        const journey = {
          id: null
        } as unknown as Journey

        setRouterQuery({ journeyId: 'test-journey-id' })

        render(
          <FlagsProvider flags={defaultFlags}>
            <SnackbarProvider>
              <JourneyProvider value={{ journey }}>
                <MultiStepForm />
              </JourneyProvider>
            </SnackbarProvider>
          </FlagsProvider>
        )
        expect(screen.getByText('Edit Manually')).toHaveAttribute(
          'aria-disabled',
          'true'
        )
      })
    })

    describe('progress stepper', () => {
      it('should not render progress stepper when journey has no customization capabilities', async () => {
        const journeyWithNoCapabilities = {
          ...journey,
          journeyCustomizationDescription: null,
          journeyCustomizationFields: [],
          chatButtons: [],
          blocks: []
        } as unknown as Journey

        setRouterQuery({ journeyId: journeyWithNoCapabilities.id })

        render(
          <FlagsProvider flags={defaultFlags}>
            <SnackbarProvider>
              <JourneyProvider value={{ journey: journeyWithNoCapabilities }}>
                <MultiStepForm />
              </JourneyProvider>
            </SnackbarProvider>
          </FlagsProvider>
        )
        expect(screen.getByTestId('MultiStepForm')).toBeInTheDocument()
        expect(
          screen.queryByTestId('progress-stepper-step-0')
        ).not.toBeInTheDocument()
        expect(
          screen.queryByTestId('progress-stepper-step-1')
        ).not.toBeInTheDocument()
      })
    })
  })

  describe('navigation', () => {
    describe('when screen is missing or invalid', () => {
      it('should redirect to first screen when opening customize without screen query (no error snackbar)', async () => {
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
          blocks: [
            {
              __typename: 'ButtonBlock',
              id: '1',
              label: 'Test Button',
              action: {
                __typename: 'LinkAction',
                url: 'https://wa.me/123',
                customizable: true,
                parentStepId: null
              }
            }
          ]
        } as unknown as Journey

        const journeyId = journeyWithAllCapabilities.id
        setRouterQuery({ journeyId }, { isReady: true })

        render(
          <FlagsProvider flags={defaultFlags}>
            <SnackbarProvider>
              <JourneyProvider value={{ journey: journeyWithAllCapabilities }}>
                <MultiStepForm />
              </JourneyProvider>
            </SnackbarProvider>
          </FlagsProvider>
        )

        await waitFor(() => {
          expect(mockReplace).toHaveBeenCalledTimes(1)
          expect(mockReplace).toHaveBeenCalledWith(
            `/templates/${journeyId}/customize?screen=language`
          )
        })
        expect(
          screen.queryByText(
            'Invalid customization step. You have been redirected to the first step.'
          )
        ).not.toBeInTheDocument()
      })

      it('should redirect to first screen when URL has invalid screen param', async () => {
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
          blocks: [
            {
              __typename: 'ButtonBlock',
              id: '1',
              label: 'Test Button',
              action: {
                __typename: 'LinkAction',
                url: 'https://wa.me/123',
                customizable: true,
                parentStepId: null
              }
            }
          ]
        } as unknown as Journey

        const journeyId = journeyWithAllCapabilities.id
        setRouterQuery({ journeyId, screen: 'invalid' }, { isReady: true })

        render(
          <FlagsProvider flags={defaultFlags}>
            <SnackbarProvider>
              <JourneyProvider value={{ journey: journeyWithAllCapabilities }}>
                <MultiStepForm />
              </JourneyProvider>
            </SnackbarProvider>
          </FlagsProvider>
        )

        expect(
          await screen.findByText(
            'Invalid customization step. You have been redirected to the first step.'
          )
        ).toBeInTheDocument()
        expect(mockReplace).toHaveBeenCalledTimes(1)
        expect(mockReplace).toHaveBeenCalledWith(
          `/templates/${journeyId}/customize?screen=language`
        )
      })

      it('should redirect to first screen when URL has screen not in journey flow', async () => {
        const journeyWithNoCapabilities = {
          ...journey,
          journeyCustomizationDescription: null,
          journeyCustomizationFields: [],
          chatButtons: [],
          blocks: []
        } as unknown as Journey

        const journeyId = journeyWithNoCapabilities.id
        setRouterQuery({ journeyId, screen: 'text' }, { isReady: true })

        render(
          <FlagsProvider flags={defaultFlags}>
            <SnackbarProvider>
              <JourneyProvider value={{ journey: journeyWithNoCapabilities }}>
                <MultiStepForm />
              </JourneyProvider>
            </SnackbarProvider>
          </FlagsProvider>
        )

        expect(
          await screen.findByText(
            'Invalid customization step. You have been redirected to the first step.'
          )
        ).toBeInTheDocument()
        expect(mockReplace).toHaveBeenCalledTimes(1)
        expect(mockReplace).toHaveBeenCalledWith(
          `/templates/${journeyId}/customize?screen=language`
        )
      })
    })

    describe('guest access', () => {
      it('should redirect guest to language screen when on non-guest-accessible screen (e.g. social)', async () => {
        mockUseAuth.mockReturnValue(guestAuth)

        const journeyWithNoCapabilities = {
          ...journey,
          journeyCustomizationDescription: null,
          journeyCustomizationFields: [],
          chatButtons: [],
          blocks: []
        } as unknown as Journey

        const journeyId = journeyWithNoCapabilities.id
        setRouterQuery({ journeyId, screen: 'social' }, { isReady: true })

        render(
          <FlagsProvider flags={{ templateCustomizationGuestFlow: true }}>
            <SnackbarProvider>
              <JourneyProvider value={{ journey: journeyWithNoCapabilities }}>
                <MultiStepForm />
              </JourneyProvider>
            </SnackbarProvider>
          </FlagsProvider>
        )

        expect(
          await screen.findByText(
            'This step is not available for guests. You have been redirected.'
          )
        ).toBeInTheDocument()
        expect(mockReplace).toHaveBeenCalledWith(
          `/templates/${journeyId}/customize?screen=language`
        )
      })

      it('should redirect guest to language screen when flag is false (safer: no guest access)', async () => {
        mockUseAuth.mockReturnValue(guestAuth)

        const journeyWithNoCapabilities = {
          ...journey,
          journeyCustomizationDescription: null,
          journeyCustomizationFields: [],
          chatButtons: [],
          blocks: []
        } as unknown as Journey

        const journeyId = journeyWithNoCapabilities.id
        setRouterQuery({ journeyId, screen: 'text' }, { isReady: true })

        render(
          <FlagsProvider flags={{ templateCustomizationGuestFlow: false }}>
            <SnackbarProvider>
              <JourneyProvider value={{ journey: journeyWithNoCapabilities }}>
                <MultiStepForm />
              </JourneyProvider>
            </SnackbarProvider>
          </FlagsProvider>
        )

        expect(
          await screen.findByText(
            'This step is not available for guests. You have been redirected.'
          )
        ).toBeInTheDocument()
        expect(mockReplace).toHaveBeenCalledWith(
          `/templates/${journeyId}/customize?screen=language`
        )
      })

      it('should redirect guest to language screen when flag is null (safer: flag not served)', async () => {
        mockUseAuth.mockReturnValue(guestAuth)

        const journeyWithNoCapabilities = {
          ...journey,
          journeyCustomizationDescription: null,
          journeyCustomizationFields: [],
          chatButtons: [],
          blocks: []
        } as unknown as Journey

        const journeyId = journeyWithNoCapabilities.id
        setRouterQuery({ journeyId, screen: 'language' }, { isReady: true })

        render(
          <FlagsProvider flags={{}}>
            <SnackbarProvider>
              <JourneyProvider value={{ journey: journeyWithNoCapabilities }}>
                <MultiStepForm />
              </JourneyProvider>
            </SnackbarProvider>
          </FlagsProvider>
        )

        expect(
          await screen.findByText(
            'This step is not available for guests. You have been redirected.'
          )
        ).toBeInTheDocument()
        expect(mockReplace).toHaveBeenCalledWith(
          `/templates/${journeyId}/customize?screen=language`
        )
      })

      it('should not redirect when user is signed in even on any screen', () => {
        mockUseAuth.mockReturnValue({
          user: {
            id: 'signed-in-user-id',
            email: null,
            displayName: null,
            photoURL: null,
            phoneNumber: null,
            emailVerified: false,
            token: 'mock-token'
          }
        })

        const journeyWithNoCapabilities = {
          ...journey,
          journeyCustomizationDescription: null,
          journeyCustomizationFields: [],
          chatButtons: [],
          blocks: []
        } as unknown as Journey

        const journeyId = journeyWithNoCapabilities.id
        setRouterQuery({ journeyId, screen: 'social' }, { isReady: true })

        render(
          <FlagsProvider flags={{ templateCustomizationGuestFlow: true }}>
            <SnackbarProvider>
              <JourneyProvider value={{ journey: journeyWithNoCapabilities }}>
                <MultiStepForm />
              </JourneyProvider>
            </SnackbarProvider>
          </FlagsProvider>
        )

        expect(mockReplace).not.toHaveBeenCalled()
      })
    })

    it('should call router.replace with correct URL when handleScreenNavigation is called', () => {
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
        blocks: [
          {
            __typename: 'ButtonBlock',
            id: '1',
            label: 'Test Button',
            action: {
              __typename: 'LinkAction',
              url: 'https://wa.me/123',
              customizable: true,
              parentStepId: null
            }
          }
        ]
      } as unknown as Journey

      const journeyId = journeyWithAllCapabilities.id
      setRouterQuery({ journeyId, screen: 'done' })

      render(
        <FlagsProvider flags={defaultFlags}>
          <SnackbarProvider>
            <JourneyProvider value={{ journey: journeyWithAllCapabilities }}>
              <MultiStepForm />
            </JourneyProvider>
          </SnackbarProvider>
        </FlagsProvider>
      )

      expect(screen.getByTestId('done-screen')).toBeInTheDocument()
      fireEvent.click(screen.getByTestId('done-screen-go-to-language'))

      expect(mockReplace).toHaveBeenCalledTimes(1)
      expect(mockReplace).toHaveBeenCalledWith(
        `/templates/${journeyId}/customize?screen=language`
      )
    })

    it('should call router.replace with override journey id and next screen when handleNext(overrideJourneyId) is called', () => {
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
        blocks: [
          {
            __typename: 'ButtonBlock',
            id: '1',
            label: 'Test Button',
            action: {
              __typename: 'LinkAction',
              url: 'https://wa.me/123',
              customizable: true,
              parentStepId: null
            }
          }
        ]
      } as unknown as Journey

      const journeyId = journeyWithAllCapabilities.id
      setRouterQuery({ journeyId, screen: 'language' })

      render(
        <FlagsProvider flags={defaultFlags}>
          <SnackbarProvider>
            <JourneyProvider value={{ journey: journeyWithAllCapabilities }}>
              <MultiStepForm />
            </JourneyProvider>
          </SnackbarProvider>
        </FlagsProvider>
      )

      expect(screen.getByTestId('language-screen')).toBeInTheDocument()
      fireEvent.click(screen.getByTestId('language-next-with-override'))

      expect(mockReplace).toHaveBeenCalledTimes(1)
      expect(mockReplace).toHaveBeenCalledWith(
        '/templates/override-journey-id/customize?screen=text'
      )
    })
  })
})
