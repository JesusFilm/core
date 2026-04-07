import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { type NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '../../../../libs/JourneyProvider'
import { JourneyFields_journeyCustomizationFields as JourneyCustomizationField } from '../../../../libs/JourneyProvider/__generated__/JourneyFields'
import { JourneyForTemplate } from '../../CreateJourneyButton'
import { journey } from '../../TemplateFooter/data'

import { TemplateActionButton } from './TemplateActionButton'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

const customizableJourney = { ...journey, customizable: true }
const nonCustomizableJourney = { ...journey, customizable: false }

const customizableTemplateJourney: JourneyForTemplate = {
  ...journey,
  customizable: true,
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

  describe('when journey is accessed from the context', () => {
    it('should render UseThisTemplateButton when journey is customizable and user is signed in', () => {
      render(
        <MockedProvider>
          <SnackbarProvider>
            <JourneyProvider value={{ journey: customizableJourney }}>
              <TemplateActionButton signedIn={signedIn} />
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
      render(
        <MockedProvider>
          <SnackbarProvider>
            <JourneyProvider value={{ journey: customizableJourney }}>
              <TemplateActionButton signedIn={signedOut} />
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
      render(
        <MockedProvider>
          <SnackbarProvider>
            <JourneyProvider value={{ journey: nonCustomizableJourney }}>
              <TemplateActionButton signedIn={signedIn} />
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
      render(
        <MockedProvider>
          <SnackbarProvider>
            <JourneyProvider value={{ journey: nonCustomizableJourney }}>
              <TemplateActionButton signedIn={signedOut} />
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
      render(
        <MockedProvider>
          <SnackbarProvider>
            <JourneyProvider value={{ journey: customizableJourney }}>
              <TemplateActionButton variant="menu-item" />
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
      render(
        <MockedProvider>
          <SnackbarProvider>
            <JourneyProvider value={{ journey: customizableJourney }}>
              <TemplateActionButton variant="menu-item" />
            </JourneyProvider>
          </SnackbarProvider>
        </MockedProvider>
      )

      fireEvent.click(screen.getByTestId('UseThisTemplateMenuItem'))

      await waitFor(() => {
        expect(mockUseRouter().push).toHaveBeenCalledWith(
          `/templates/${journey.id}/customize`,
          undefined,
          { shallow: true }
        )
      })
    })

    it('should open account check dialog when button is clicked and user is not signed in', async () => {
      render(
        <MockedProvider>
          <SnackbarProvider>
            <JourneyProvider value={{ journey: customizableJourney }}>
              <TemplateActionButton variant="button" signedIn={false} />
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
      render(
        <MockedProvider>
          <SnackbarProvider>
            <JourneyProvider value={{ journey: nonCustomizableJourney }}>
              <TemplateActionButton variant="menu-item" />
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
      render(
        <MockedProvider>
          <SnackbarProvider>
            <JourneyProvider value={{ journey: nonCustomizableJourney }}>
              <TemplateActionButton variant="button" signedIn={true} />
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

  describe('when journey is accessed via prop drill', () => {
    it('should render UseThisTemplateButton when journey prop is customizable', () => {
      render(
        <MockedProvider>
          <SnackbarProvider>
            <JourneyProvider value={{ journey }}>
              <TemplateActionButton
                signedIn={signedIn}
                journey={customizableTemplateJourney}
              />
            </JourneyProvider>
          </SnackbarProvider>
        </MockedProvider>
      )

      expect(screen.getByTestId('UseThisTemplateButton')).toBeInTheDocument()
      expect(
        screen.queryByTestId('CreateJourneyButton')
      ).not.toBeInTheDocument()
    })

    it('should render CreateJourneyButton when journey prop is not customizable', () => {
      const nonCustomizableTemplateProp: JourneyForTemplate = {
        ...journey,
        customizable: false
      }

      render(
        <MockedProvider>
          <SnackbarProvider>
            <JourneyProvider value={{ journey }}>
              <TemplateActionButton
                signedIn={signedIn}
                journey={nonCustomizableTemplateProp}
              />
            </JourneyProvider>
          </SnackbarProvider>
        </MockedProvider>
      )

      expect(screen.getByTestId('CreateJourneyButton')).toBeInTheDocument()
      expect(
        screen.queryByTestId('UseThisTemplateButton')
      ).not.toBeInTheDocument()
    })

    it('should push to customization flow when button is clicked, journey prop is customizable, and user is signed in', async () => {
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
          `/templates/${customizableTemplateJourney.id}/customize`,
          undefined,
          { shallow: true }
        )
      })
    })
  })
})
