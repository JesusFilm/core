import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { type NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'

import { isJourneyCustomizable } from '../../../../libs/isJourneyCustomizable'
import { JourneyProvider } from '../../../../libs/JourneyProvider'
import { JourneyFields_journeyCustomizationFields as JourneyCustomizationField } from '../../../../libs/JourneyProvider/__generated__/JourneyFields'
import { JourneyForTemplate } from '../../CreateJourneyButton'
import { journey } from '../../TemplateFooter/data'

import { TemplateActionButton } from './TemplateActionButton'

jest.mock('../../../../libs/isJourneyCustomizable', () => ({
  isJourneyCustomizable: jest.fn()
}))

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockIsJourneyCustomizable = isJourneyCustomizable as jest.MockedFunction<
  typeof isJourneyCustomizable
>

const customizableTemplateJourney: JourneyForTemplate = {
  ...journey,
  journeyCustomizationDescription: 'Customize this journey',
  journeyCustomizationFields: [
    {
      id: 'field1',
      __typename: 'JourneyCustomizationField'
    } as JourneyCustomizationField
  ]
}

describe('TemplateActionButton', () => {
  const signedIn = true
  const signedOut = false

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRouter.mockReturnValue({
      query: {},
      push: jest.fn(),
      prefetch: jest.fn(),
      replace: jest.fn(),
      pathname: '/templates/journeyId'
    } as unknown as NextRouter)
  })

  describe.each([
    ['when journey is accessed from the context', undefined],
    ['when journey is accessed via prop drill', journey]
  ])('%s', (_, templateJourney) => {
    it('should render UseThisTemplateButton when journey is customizable and user is signed in', () => {
      mockIsJourneyCustomizable.mockReturnValue(true)

      render(
        <MockedProvider>
          <SnackbarProvider>
            <JourneyProvider value={{ journey }}>
              <TemplateActionButton
                signedIn={signedIn}
                journey={templateJourney}
              />
            </JourneyProvider>
          </SnackbarProvider>
        </MockedProvider>
      )

      expect(screen.getByTestId('UseThisTemplateButton')).toBeInTheDocument()
      expect(
        screen.queryByTestId('UseThisTemplateButtonSkeleton')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByTestId('CreateJourneyButton')
      ).not.toBeInTheDocument()
    })

    it('should render UseThisTemplateButton when journey is customizable and user is signed out', () => {
      mockIsJourneyCustomizable.mockReturnValue(true)

      render(
        <MockedProvider>
          <SnackbarProvider>
            <JourneyProvider value={{ journey }}>
              <TemplateActionButton
                signedIn={signedOut}
                journey={templateJourney}
              />
            </JourneyProvider>
          </SnackbarProvider>
        </MockedProvider>
      )

      expect(screen.getByTestId('UseThisTemplateButton')).toBeInTheDocument()
      expect(
        screen.queryByTestId('UseThisTemplateButtonSkeleton')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByTestId('CreateJourneyButton')
      ).not.toBeInTheDocument()
    })

    it('should render CreateJourneyButton when journey is not customizable and user is signed in', () => {
      mockIsJourneyCustomizable.mockReturnValue(false)

      render(
        <MockedProvider>
          <SnackbarProvider>
            <JourneyProvider value={{ journey }}>
              <TemplateActionButton
                signedIn={signedIn}
                journey={templateJourney}
              />
            </JourneyProvider>
          </SnackbarProvider>
        </MockedProvider>
      )

      expect(screen.getByTestId('CreateJourneyButton')).toBeInTheDocument()
      expect(
        screen.queryByTestId('UseThisTemplateButton')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByTestId('UseThisTemplateButtonSkeleton')
      ).not.toBeInTheDocument()
    })

    it('should render CreateJourneyButton when journey is not customizable and user is signed out', () => {
      mockIsJourneyCustomizable.mockReturnValue(false)

      render(
        <MockedProvider>
          <SnackbarProvider>
            <JourneyProvider value={{ journey }}>
              <TemplateActionButton
                signedIn={signedOut}
                journey={templateJourney}
              />
            </JourneyProvider>
          </SnackbarProvider>
        </MockedProvider>
      )

      expect(screen.getByTestId('CreateJourneyButton')).toBeInTheDocument()
      expect(
        screen.queryByTestId('UseThisTemplateButton')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByTestId('UseThisTemplateButtonSkeleton')
      ).not.toBeInTheDocument()
    })

    it('should render skeleton loader when journey is undefined', () => {
      render(
        <MockedProvider>
          <SnackbarProvider>
            <JourneyProvider value={{ journey: undefined }}>
              <TemplateActionButton signedIn={signedIn} journey={undefined} />
            </JourneyProvider>
          </SnackbarProvider>
        </MockedProvider>
      )

      expect(
        screen.getByTestId('UseThisTemplateButtonSkeleton')
      ).toBeInTheDocument()
      expect(
        screen.queryByTestId('UseThisTemplateButton')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByTestId('CreateJourneyButton')
      ).not.toBeInTheDocument()
    })

    it('should render UseThisTemplateMenuItem when variant is menu-item', () => {
      mockIsJourneyCustomizable.mockReturnValue(true)

      render(
        <MockedProvider>
          <SnackbarProvider>
            <JourneyProvider value={{ journey }}>
              <TemplateActionButton
                variant="menu-item"
                journey={templateJourney}
              />
            </JourneyProvider>
          </SnackbarProvider>
        </MockedProvider>
      )

      expect(screen.getByTestId('UseThisTemplateMenuItem')).toBeInTheDocument()
      expect(
        screen.getByRole('menuitem', { name: 'Use This Template' })
      ).toBeInTheDocument()
    })

    it('should push to customization flow when menu-item is clicked and journey is customizable', async () => {
      mockIsJourneyCustomizable.mockReturnValue(true)
      const journeyId = templateJourney?.id ?? journey?.id ?? ''

      render(
        <MockedProvider>
          <SnackbarProvider>
            <JourneyProvider value={{ journey }}>
              <TemplateActionButton
                variant="menu-item"
                journey={templateJourney}
              />
            </JourneyProvider>
          </SnackbarProvider>
        </MockedProvider>
      )

      fireEvent.click(screen.getByTestId('UseThisTemplateMenuItem'))

      await waitFor(() => {
        expect(mockUseRouter().push).toHaveBeenCalledWith(
          `/templates/${journeyId}/customize`,
          undefined,
          { shallow: true }
        )
      })
    })

    it('should open account check dialog when button is clicked and user is not signed in', async () => {
      mockIsJourneyCustomizable.mockReturnValue(true)

      render(
        <MockedProvider>
          <SnackbarProvider>
            <JourneyProvider value={{ journey }}>
              <TemplateActionButton
                variant="button"
                signedIn={false}
                journey={templateJourney}
              />
            </JourneyProvider>
          </SnackbarProvider>
        </MockedProvider>
      )

      fireEvent.click(screen.getByRole('button', { name: 'Use This Template' }))

      await waitFor(() => {
        expect(screen.getByText('We Like Your Choice!')).toBeInTheDocument()
        expect(screen.getByText('Login with my account')).toBeInTheDocument()
        expect(screen.getByText('Create a new account')).toBeInTheDocument()
      })
    })

    it('should open copy to team dialog when menu-item is clicked and journey is not customizable', async () => {
      mockIsJourneyCustomizable.mockReturnValue(false)

      render(
        <MockedProvider>
          <SnackbarProvider>
            <JourneyProvider value={{ journey }}>
              <TemplateActionButton
                variant="menu-item"
                journey={templateJourney}
              />
            </JourneyProvider>
          </SnackbarProvider>
        </MockedProvider>
      )

      fireEvent.click(
        screen.getByRole('menuitem', { name: 'Use This Template' })
      )

      await waitFor(() => {
        expect(screen.getByTestId('CopyToTeamDialog')).toBeInTheDocument()
      })
    })

    it('should open copy to team dialog when button is clicked, journey is not customizable, and user is signed in', async () => {
      mockIsJourneyCustomizable.mockReturnValue(false)

      render(
        <MockedProvider>
          <SnackbarProvider>
            <JourneyProvider value={{ journey }}>
              <TemplateActionButton
                variant="button"
                signedIn={true}
                journey={templateJourney}
              />
            </JourneyProvider>
          </SnackbarProvider>
        </MockedProvider>
      )

      fireEvent.click(screen.getByRole('button', { name: 'Use This Template' }))

      await waitFor(() => {
        expect(screen.getByTestId('CopyToTeamDialog')).toBeInTheDocument()
      })
    })
  })

  describe.each([
    [
      'when customizable template journey is accessed from the context',
      undefined
    ],
    [
      'when customizable template journey is accessed via prop drill',
      customizableTemplateJourney
    ]
  ])('%s', (_, customizableTemplateJourney) => {
    it('should push to customization flow when button is clicked, journey is customizable, and user is signed in', async () => {
      mockIsJourneyCustomizable.mockReturnValue(true)

      render(
        <MockedProvider>
          <SnackbarProvider>
            <JourneyProvider value={{ journey }}>
              <TemplateActionButton
                variant="button"
                signedIn={true}
                journey={customizableTemplateJourney}
              />
            </JourneyProvider>
          </SnackbarProvider>
        </MockedProvider>
      )

      fireEvent.click(screen.getByRole('button', { name: 'Use This Template' }))

      await waitFor(() => {
        expect(mockUseRouter().push).toHaveBeenCalledWith(
          `/templates/${customizableTemplateJourney?.id ?? journey?.id ?? ''}/customize`,
          undefined,
          { shallow: true }
        )
      })
    })
  })
})
