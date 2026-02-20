import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { type NextRouter, useRouter } from 'next/router'

import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { JourneyProvider } from '../../../libs/JourneyProvider'
import type { JourneyFields as Journey } from '../../../libs/JourneyProvider/__generated__/JourneyFields'
import { journey as mockJourney } from '../../../libs/JourneyProvider/JourneyProvider.mock'

import { UseThisTemplateButton } from './UseThisTemplateButton'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

const journey: Journey = {
  ...mockJourney,
  title: 'Template',
  description: 'Description',
  template: true,
  slug: 'default',
  status: JourneyStatus.published,
  publishedAt: '2021-11-19T12:34:56.647Z',
  language: {
    ...mockJourney.language,
    name: [
      {
        __typename: 'LanguageName',
        value: 'English',
        primary: true
      },
      {
        __typename: 'LanguageName',
        value: 'English',
        primary: false
      }
    ]
  }
}

describe('UseThisTemplateButton', () => {
  const prefetch = jest.fn()
  const push = jest.fn().mockResolvedValue('')
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe.each([
    ['when journey is accessed from the context', undefined],
    ['when journey is accessed via prop drill', journey]
  ])('%s', (_, customizableTemplateJourney) => {
    it('should render use this template button when variant is button', () => {
      mockUseRouter.mockReturnValue({
        prefetch,
        query: { createNew: false }
      } as unknown as NextRouter)

      render(
        <JourneyProvider value={{ journey }}>
          <UseThisTemplateButton
            variant="button"
            journeyId={customizableTemplateJourney?.id}
          />
        </JourneyProvider>
      )

      expect(screen.getByTestId('UseThisTemplateButton')).toBeInTheDocument()
      expect(
        screen.queryByTestId('UseThisTemplateMenuItem')
      ).not.toBeInTheDocument()
    })

    it('should render use this template menu item when variant is menu-item', () => {
      mockUseRouter.mockReturnValue({
        prefetch,
        query: { createNew: false }
      } as unknown as NextRouter)

      render(
        <JourneyProvider value={{ journey }}>
          <UseThisTemplateButton
            variant="menu-item"
            journeyId={customizableTemplateJourney?.id}
          />
        </JourneyProvider>
      )

      expect(screen.getByTestId('UseThisTemplateMenuItem')).toBeInTheDocument()
      expect(
        screen.queryByTestId('UseThisTemplateButton')
      ).not.toBeInTheDocument()
    })

    describe('when signed in', () => {
      beforeEach(() => {
        mockUseRouter.mockReturnValue({
          prefetch,
          push,
          query: { createNew: false }
        } as unknown as NextRouter)
      })

      it('should navigate to customize page when button is clicked', async () => {
        const journeyId = customizableTemplateJourney?.id ?? journey?.id ?? ''
        render(
          <JourneyProvider value={{ journey }}>
            <UseThisTemplateButton
              signedIn
              journeyId={customizableTemplateJourney?.id}
            />
          </JourneyProvider>
        )

        fireEvent.click(
          screen.getByRole('button', { name: 'Use This Template' })
        )

        await waitFor(() => {
          expect(push).toHaveBeenCalledWith(
            `/templates/${journeyId}/customize`,
            undefined,
            { shallow: true }
          )
        })
      })

      it('should prefetch customize page on mouse enter', async () => {
        const journeyId = customizableTemplateJourney?.id ?? journey?.id ?? ''
        render(
          <JourneyProvider value={{ journey }}>
            <UseThisTemplateButton
              signedIn
              journeyId={customizableTemplateJourney?.id}
            />
          </JourneyProvider>
        )

        fireEvent.mouseEnter(
          screen.getByRole('button', { name: 'Use This Template' })
        )

        await waitFor(() => {
          expect(prefetch).toHaveBeenCalledWith(
            `/templates/${journeyId}/customize`
          )
        })
      })

      it('should show loading state while navigating', async () => {
        const journeyId = customizableTemplateJourney?.id ?? journey?.id ?? ''

        mockUseRouter.mockReturnValue({
          prefetch,
          push,
          query: { createNew: false }
        } as unknown as NextRouter)

        render(
          <JourneyProvider value={{ journey }}>
            <UseThisTemplateButton
              signedIn
              journeyId={customizableTemplateJourney?.id}
            />
          </JourneyProvider>
        )

        fireEvent.click(
          screen.getByRole('button', { name: 'Use This Template' })
        )

        await waitFor(() => {
          expect(screen.getByRole('progressbar')).toBeInTheDocument()
        })
        await waitFor(() => {
          expect(push).toHaveBeenCalledWith(
            `/templates/${journeyId}/customize`,
            undefined,
            { shallow: true }
          )
        })
      })
    })

    describe('when not signed in', () => {
      beforeEach(() => {
        mockUseRouter.mockReturnValue({
          prefetch,
          push,
          query: { createNew: false }
        } as unknown as NextRouter)
      })

      afterEach(() => {
        jest.resetAllMocks()
      })

      it('should prefetch sign in page on mount', async () => {
        render(
          <JourneyProvider value={{ journey }}>
            <UseThisTemplateButton
              journeyId={customizableTemplateJourney?.id}
            />
          </JourneyProvider>
        )

        await waitFor(() => {
          expect(prefetch).toHaveBeenCalledWith('/users/sign-in')
        })
      })

      it('should open account check dialog when button is clicked', async () => {
        render(
          <JourneyProvider value={{ journey }}>
            <UseThisTemplateButton
              journeyId={customizableTemplateJourney?.id}
            />
          </JourneyProvider>
        )

        fireEvent.click(
          screen.getByRole('button', { name: 'Use This Template' })
        )

        await waitFor(() => {
          expect(screen.getByText('Login with my account')).toBeInTheDocument()
          expect(screen.getByText('Create a new account')).toBeInTheDocument()
        })
      })

      it('should redirect to sign in page when login is clicked', async () => {
        const journeyId = customizableTemplateJourney?.id ?? journey?.id ?? ''
        render(
          <JourneyProvider value={{ journey }}>
            <UseThisTemplateButton
              journeyId={customizableTemplateJourney?.id}
            />
          </JourneyProvider>
        )

        fireEvent.click(
          screen.getByRole('button', { name: 'Use This Template' })
        )
        fireEvent.click(
          screen.getByRole('button', { name: 'Login with my account' })
        )

        await waitFor(() => {
          expect(push).toHaveBeenCalledWith(
            {
              pathname: expect.stringContaining('/users/sign-in'),
              query: {
                redirect: expect.stringContaining(
                  `/templates/${journeyId}?createNew=true`
                ),
                login: true
              }
            },
            undefined,
            { shallow: true }
          )
        })
      })

      it('should redirect to sign in page when create account is clicked', async () => {
        const journeyId = customizableTemplateJourney?.id ?? journey?.id ?? ''
        render(
          <JourneyProvider value={{ journey }}>
            <UseThisTemplateButton
              journeyId={customizableTemplateJourney?.id}
            />
          </JourneyProvider>
        )

        fireEvent.click(
          screen.getByRole('button', { name: 'Use This Template' })
        )
        fireEvent.click(
          screen.getByRole('button', { name: 'Create a new account' })
        )

        await waitFor(() => {
          expect(push).toHaveBeenCalledWith(
            {
              pathname: expect.stringContaining('/users/sign-in'),
              query: {
                redirect: expect.stringContaining(
                  `/templates/${journeyId}?createNew=true`
                ),
                login: false
              }
            },
            undefined,
            { shallow: true }
          )
        })
      })
    })

    describe('when not signed in and viewing from journeys admin', () => {
      beforeAll(() => {
        mockUseRouter.mockReturnValue({
          prefetch,
          push,
          query: { createNew: false }
        } as unknown as NextRouter)

        process.env = {
          ...originalEnv,
          NEXT_PUBLIC_JOURNEYS_ADMIN_URL: 'http://localhost:4200'
        }
      })

      afterAll(() => {
        process.env = originalEnv
      })

      it('should redirect to sign in page when login is clicked', async () => {
        const journeyId = customizableTemplateJourney?.id ?? journey?.id ?? ''
        render(
          <JourneyProvider value={{ journey }}>
            <UseThisTemplateButton
              journeyId={customizableTemplateJourney?.id}
            />
          </JourneyProvider>
        )

        fireEvent.click(
          screen.getByRole('button', { name: 'Use This Template' })
        )
        fireEvent.click(
          screen.getByRole('button', { name: 'Login with my account' })
        )

        await waitFor(() => {
          expect(push).toHaveBeenCalledWith(
            {
              pathname: expect.stringContaining('/users/sign-in'),
              query: {
                redirect: expect.stringContaining(
                  `/templates/${journeyId}?createNew=true`
                ),
                login: true
              }
            },
            undefined,
            { shallow: true }
          )
        })
      })

      it('should redirect to sign in page when create account is clicked', async () => {
        const journeyId = customizableTemplateJourney?.id ?? journey?.id ?? ''
        render(
          <JourneyProvider value={{ journey }}>
            <UseThisTemplateButton
              journeyId={customizableTemplateJourney?.id}
            />
          </JourneyProvider>
        )

        fireEvent.click(
          screen.getByRole('button', { name: 'Use This Template' })
        )
        fireEvent.click(
          screen.getByRole('button', { name: 'Create a new account' })
        )

        await waitFor(() => {
          expect(push).toHaveBeenCalledWith(
            {
              pathname: expect.stringContaining('/users/sign-in'),
              query: {
                redirect: expect.stringContaining(
                  `/templates/${journeyId}?createNew=true`
                ),
                login: false
              }
            },
            undefined,
            { shallow: true }
          )
        })
      })
    })

    describe('when not signed in and viewing from another project', () => {
      beforeEach(() => {
        mockUseRouter.mockReturnValue({
          prefetch,
          push,
          query: { createNew: false }
        } as unknown as NextRouter)

        process.env = {
          ...originalEnv,
          NEXT_PUBLIC_JOURNEYS_ADMIN_URL: 'http://localhost:4200'
        }
      })

      afterAll(() => {
        process.env = originalEnv
      })

      it('should redirect to journeys admin sign in page when login is clicked', async () => {
        const journeyId = customizableTemplateJourney?.id ?? journey?.id ?? ''
        render(
          <JourneyProvider value={{ journey }}>
            <UseThisTemplateButton
              journeyId={customizableTemplateJourney?.id}
            />
          </JourneyProvider>
        )

        fireEvent.click(
          screen.getByRole('button', { name: 'Use This Template' })
        )
        fireEvent.click(
          screen.getByRole('button', { name: 'Login with my account' })
        )

        await waitFor(() => {
          expect(push).toHaveBeenCalledWith(
            {
              pathname: expect.stringContaining('/users/sign-in'),
              query: {
                redirect: expect.stringContaining(
                  `/templates/${journeyId}?createNew=true`
                ),
                login: true
              }
            },
            undefined,
            { shallow: true }
          )
        })
      })

      it('should redirect to journeys admin sign in page when create account is clicked', async () => {
        const journeyId = customizableTemplateJourney?.id ?? journey?.id ?? ''
        render(
          <JourneyProvider value={{ journey }}>
            <UseThisTemplateButton
              journeyId={customizableTemplateJourney?.id}
            />
          </JourneyProvider>
        )

        fireEvent.click(
          screen.getByRole('button', { name: 'Use This Template' })
        )
        fireEvent.click(
          screen.getByRole('button', { name: 'Create a new account' })
        )

        await waitFor(() => {
          expect(push).toHaveBeenCalledWith(
            {
              pathname: expect.stringContaining('/users/sign-in'),
              query: {
                redirect: expect.stringContaining(
                  `/templates/${journeyId}?createNew=true`
                ),
                login: false
              }
            },
            undefined,
            { shallow: true }
          )
        })
      })
    })

    it('should disable button when journey is not available', async () => {
      mockUseRouter.mockReturnValue({
        prefetch,
        push,
        query: { createNew: false }
      } as unknown as NextRouter)

      render(
        <JourneyProvider value={{}}>
          <UseThisTemplateButton signedIn />
        </JourneyProvider>
      )

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: 'Use This Template' })
        ).toBeDisabled()
      })
    })

    it('should have correct test id', async () => {
      render(
        <JourneyProvider value={{ journey }}>
          <UseThisTemplateButton journeyId={customizableTemplateJourney?.id} />
        </JourneyProvider>
      )

      expect(screen.getByTestId('UseThisTemplateButton')).toBeInTheDocument()
    })
  })
})
