import { MockedProvider } from '@apollo/client/testing'
import { NextRouter, useRouter } from 'next/router'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { v4 as uuidv4 } from 'uuid'
import {
  variables,
  journeyCreateData,
  CREATE_JOURNEY
} from '../../libs/useJourneyCreate'
import { GET_ONBOARDING_TEMPLATE } from './OnboardingPanelContent'
import { OnboardingPanelContent } from '.'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('OnboardingPanelContent', () => {
  const mocks = [
    {
      request: {
        query: GET_ONBOARDING_TEMPLATE,
        variables: {
          id: '014c7add-288b-4f84-ac85-ccefef7a07d3'
        }
      },
      result: {
        data: {
          template: {
            id: '014c7add-288b-4f84-ac85-ccefef7a07d3',
            title: 'template 1 title',
            description: 'template 1 description',
            primaryImageBlock: null
          }
        }
      }
    },
    {
      request: {
        query: GET_ONBOARDING_TEMPLATE,
        variables: {
          id: 'c4889bb1-49ac-41c9-8fdb-0297afb32cd9'
        }
      },
      result: {
        data: {
          template: {
            id: 'c4889bb1-49ac-41c9-8fdb-0297afb32cd9',
            title: 'template 2 title',
            description: 'template 2 description',
            primaryImageBlock: null
          }
        }
      }
    },
    {
      request: {
        query: GET_ONBOARDING_TEMPLATE,
        variables: {
          id: 'e978adb4-e4d8-42ef-89a9-79811f10b7e9'
        }
      },
      result: {
        data: {
          template: {
            id: 'e978adb4-e4d8-42ef-89a9-79811f10b7e9',
            title: 'template 3 title',
            description: 'template 3 description',
            primaryImageBlock: null
          }
        }
      }
    },
    {
      request: {
        query: GET_ONBOARDING_TEMPLATE,
        variables: {
          id: '178c01bd-371c-4e73-a9b8-e2bb95215fd8'
        }
      },
      result: {
        data: {
          template: {
            id: '178c01bd-371c-4e73-a9b8-e2bb95215fd8',
            title: 'template 4 title',
            description: 'template 4 description',
            primaryImageBlock: null
          }
        }
      }
    },
    {
      request: {
        query: GET_ONBOARDING_TEMPLATE,
        variables: {
          id: '13317d05-a805-4b3c-b362-9018971d9b57'
        }
      },
      result: {
        data: {
          template: {
            id: '13317d05-a805-4b3c-b362-9018971d9b57',
            title: 'template 5 title',
            description: 'template 5 description',
            primaryImageBlock: null
          }
        }
      }
    },
    {
      request: {
        query: CREATE_JOURNEY,
        variables
      },
      result: { data: journeyCreateData }
    }
  ]

  it('should add a new journey on custom journey button click', async () => {
    const push = jest.fn()
    mockUseRouter.mockReturnValue({ push } as unknown as NextRouter)
    mockUuidv4.mockReturnValueOnce(variables.journeyId)
    mockUuidv4.mockReturnValueOnce(variables.stepId)
    mockUuidv4.mockReturnValueOnce(variables.cardId)
    mockUuidv4.mockReturnValueOnce(variables.imageId)

    const { getByRole } = render(
      <MockedProvider mocks={mocks}>
        <OnboardingPanelContent />
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Create Custom Journey' }))

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        `/journeys/${variables.journeyId}/edit`,
        undefined,
        {
          shallow: true
        }
      )
    })
  })

  it('should display onboarding templates', async () => {
    const { getByText } = render(
      <MockedProvider mocks={mocks}>
        <OnboardingPanelContent />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByText('template 1 title')).toBeInTheDocument()
    )
    expect(getByText('template 2 title')).toBeInTheDocument()
    expect(getByText('template 3 title')).toBeInTheDocument()
    expect(getByText('template 4 title')).toBeInTheDocument()
    expect(getByText('template 5 title')).toBeInTheDocument()
  })

  it('should redirect to template details page onClick', async () => {
    const push = jest.fn()
    mockUseRouter.mockReturnValue({ push } as unknown as NextRouter)

    const { getByText } = render(
      <MockedProvider mocks={mocks}>
        <OnboardingPanelContent />
      </MockedProvider>
    )

    await waitFor(() =>
      expect(getByText('template 1 title')).toBeInTheDocument()
    )
    fireEvent.click(getByText('template 1 title'))
    expect(push).toHaveBeenCalledWith(
      '/templates/014c7add-288b-4f84-ac85-ccefef7a07d3'
    )
  })

  it('should redirect on See all link', () => {
    const { getByRole } = render(
      <MockedProvider mocks={[]}>
        <OnboardingPanelContent />
      </MockedProvider>
    )

    expect(getByRole('link', { name: 'See all' })).toHaveAttribute(
      'href',
      '/templates'
    )
  })

  it('should redirect on See all templates button', () => {
    const { getByRole } = render(
      <MockedProvider mocks={[]}>
        <OnboardingPanelContent />
      </MockedProvider>
    )

    expect(getByRole('link', { name: 'See all templates' })).toHaveAttribute(
      'href',
      '/templates'
    )
  })
})
