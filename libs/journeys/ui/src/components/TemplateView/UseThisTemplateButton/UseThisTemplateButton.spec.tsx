import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { type NextRouter, useRouter } from 'next/router'

import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { JourneyProvider } from '../../../libs/JourneyProvider'
import { journey as mockJourney } from '../../../libs/JourneyProvider/JourneyProvider.mock'
import type { JourneyFields as Journey } from '../../../libs/JourneyProvider/__generated__/JourneyFields'

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

function defineWindowWithPath(path: string): void {
  Object.defineProperty(window, 'location', {
    configurable: true,
    enumerable: true,
    value: { origin: path },
    writable: true
  })
}

describe('UseThisTemplateButton', () => {
  const prefetch = jest.fn()
  const push = jest.fn().mockResolvedValue('')
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('signed in', () => {
    beforeEach(() => {
      mockUseRouter.mockReturnValue({
        prefetch,
        push,
        query: { createNew: false }
      } as unknown as NextRouter)
    })

    it('should navigate to customize page when button is clicked', async () => {
      render(
        <JourneyProvider value={{ journey }}>
          <UseThisTemplateButton signedIn />
        </JourneyProvider>
      )

      fireEvent.click(screen.getByRole('button', { name: 'Use This Template' }))

      await waitFor(() => {
        expect(push).toHaveBeenCalledWith(
          '/templates/journeyId/customize',
          undefined,
          { shallow: true }
        )
      })
    })

    it('should prefetch customize page on mouse enter', async () => {
      render(
        <JourneyProvider value={{ journey }}>
          <UseThisTemplateButton signedIn />
        </JourneyProvider>
      )

      fireEvent.mouseEnter(
        screen.getByRole('button', { name: 'Use This Template' })
      )

      await waitFor(() => {
        expect(prefetch).toHaveBeenCalledWith('/templates/journeyId/customize')
      })
    })

    it('should show loading state while navigating', async () => {
      mockUseRouter.mockReturnValue({
        prefetch,
        push,
        query: { createNew: false }
      } as unknown as NextRouter)

      render(
        <JourneyProvider value={{ journey }}>
          <UseThisTemplateButton signedIn />
        </JourneyProvider>
      )

      fireEvent.click(screen.getByRole('button', { name: 'Use This Template' }))

      await waitFor(() => {
        expect(screen.getByRole('progressbar')).toBeInTheDocument()
      })
      await waitFor(() => {
        expect(push).toHaveBeenCalledWith(
          '/templates/journeyId/customize',
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

      defineWindowWithPath('http://localhost:4200')
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    it('should prefetch sign in page on mount', async () => {
      render(
        <JourneyProvider value={{ journey }}>
          <UseThisTemplateButton />
        </JourneyProvider>
      )

      await waitFor(() => {
        expect(prefetch).toHaveBeenCalledWith('/users/sign-in')
      })
    })

    it('should open account check dialog when button is clicked', async () => {
      render(
        <JourneyProvider value={{ journey }}>
          <UseThisTemplateButton />
        </JourneyProvider>
      )

      fireEvent.click(screen.getByRole('button', { name: 'Use This Template' }))

      await waitFor(() => {
        expect(screen.getByText('Login with my account')).toBeInTheDocument()
        expect(screen.getByText('Create a new account')).toBeInTheDocument()
      })
    })

    it('should redirect to sign in page when login is clicked', async () => {
      render(
        <JourneyProvider value={{ journey }}>
          <UseThisTemplateButton />
        </JourneyProvider>
      )

      fireEvent.click(screen.getByRole('button', { name: 'Use This Template' }))
      fireEvent.click(
        screen.getByRole('button', { name: 'Login with my account' })
      )

      await waitFor(() => {
        expect(push).toHaveBeenCalledWith(
          {
            pathname: 'http://localhost:4200/users/sign-in',
            query: {
              redirect:
                'http://localhost:4200/templates/journeyId?createNew=true',
              login: true
            }
          },
          undefined,
          { shallow: true }
        )
      })
    })

    it('should redirect to sign in page when create account is clicked', async () => {
      render(
        <JourneyProvider value={{ journey }}>
          <UseThisTemplateButton />
        </JourneyProvider>
      )

      fireEvent.click(screen.getByRole('button', { name: 'Use This Template' }))
      fireEvent.click(
        screen.getByRole('button', { name: 'Create a new account' })
      )

      await waitFor(() => {
        expect(push).toHaveBeenCalledWith(
          {
            pathname: 'http://localhost:4200/users/sign-in',
            query: {
              redirect:
                'http://localhost:4200/templates/journeyId?createNew=true',
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

      defineWindowWithPath('http://localhost:4200')

      process.env = {
        ...originalEnv,
        NEXT_PUBLIC_JOURNEYS_ADMIN_URL: 'http://localhost:4200'
      }
    })

    afterAll(() => {
      process.env = originalEnv
    })

    it('should redirect to sign in page when login is clicked', async () => {
      render(
        <JourneyProvider value={{ journey }}>
          <UseThisTemplateButton />
        </JourneyProvider>
      )

      fireEvent.click(screen.getByRole('button', { name: 'Use This Template' }))
      fireEvent.click(
        screen.getByRole('button', { name: 'Login with my account' })
      )

      await waitFor(() => {
        expect(push).toHaveBeenCalledWith(
          {
            pathname: 'http://localhost:4200/users/sign-in',
            query: {
              redirect:
                'http://localhost:4200/templates/journeyId?createNew=true',
              login: true
            }
          },
          undefined,
          { shallow: true }
        )
      })
    })

    it('should redirect to sign in page when create account is clicked', async () => {
      render(
        <JourneyProvider value={{ journey }}>
          <UseThisTemplateButton />
        </JourneyProvider>
      )

      fireEvent.click(screen.getByRole('button', { name: 'Use This Template' }))
      fireEvent.click(
        screen.getByRole('button', { name: 'Create a new account' })
      )

      await waitFor(() => {
        expect(push).toHaveBeenCalledWith(
          {
            pathname: 'http://localhost:4200/users/sign-in',
            query: {
              redirect:
                'http://localhost:4200/templates/journeyId?createNew=true',
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

      defineWindowWithPath('http://localhost:4300')

      process.env = {
        ...originalEnv,
        NEXT_PUBLIC_JOURNEYS_ADMIN_URL: 'http://localhost:4200'
      }
    })

    afterAll(() => {
      process.env = originalEnv
    })

    it('should redirect to journeys admin sign in page when login is clicked', async () => {
      render(
        <JourneyProvider value={{ journey }}>
          <UseThisTemplateButton />
        </JourneyProvider>
      )

      fireEvent.click(screen.getByRole('button', { name: 'Use This Template' }))
      fireEvent.click(
        screen.getByRole('button', { name: 'Login with my account' })
      )

      await waitFor(() => {
        expect(push).toHaveBeenCalledWith(
          {
            pathname: 'http://localhost:4200/users/sign-in',
            query: {
              redirect:
                'http://localhost:4200/templates/journeyId?createNew=true',
              login: true
            }
          },
          undefined,
          { shallow: true }
        )
      })
    })

    it('should redirect to journeys admin sign in page when create account is clicked', async () => {
      render(
        <JourneyProvider value={{ journey }}>
          <UseThisTemplateButton />
        </JourneyProvider>
      )

      fireEvent.click(screen.getByRole('button', { name: 'Use This Template' }))
      fireEvent.click(
        screen.getByRole('button', { name: 'Create a new account' })
      )

      await waitFor(() => {
        expect(push).toHaveBeenCalledWith(
          {
            pathname: 'http://localhost:4200/users/sign-in',
            query: {
              redirect:
                'http://localhost:4200/templates/journeyId?createNew=true',
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
        <UseThisTemplateButton />
      </JourneyProvider>
    )

    expect(screen.getByTestId('UseThisTemplateButton')).toBeInTheDocument()
  })
})
