import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { NextRouter, useRouter } from 'next/router'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { v4 as uuidv4 } from 'uuid'
import {
  variables,
  data
} from '../../libs/useJourneyCreate/useJourneyCreate.spec'
import { CREATE_JOURNEY } from '../../libs/useJourneyCreate'
import { GET_TEAMS, TeamProvider } from '../Team/TeamProvider'
import { GetTeams } from '../../../__generated__/GetTeams'
import { getOnboardingTemplateMock } from './data'
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
const getTeams: MockedResponse<GetTeams> = {
  request: {
    query: GET_TEAMS
  },
  result: {
    data: {
      teams: [{ id: 'jfp-team', title: 'Team Title', __typename: 'Team' }]
    }
  }
}

const mocks = [
  getOnboardingTemplateMock('014c7add-288b-4f84-ac85-ccefef7a07d3', '1'),
  getOnboardingTemplateMock('c4889bb1-49ac-41c9-8fdb-0297afb32cd9', '2'),
  getOnboardingTemplateMock('e978adb4-e4d8-42ef-89a9-79811f10b7e9', '3'),
  getOnboardingTemplateMock('178c01bd-371c-4e73-a9b8-e2bb95215fd8', '4'),
  getOnboardingTemplateMock('13317d05-a805-4b3c-b362-9018971d9b57', '5'),
  {
    request: {
      query: CREATE_JOURNEY,
      variables
    },
    result: { data }
  },
  getTeams
]

describe('OnboardingPanelContent', () => {
  it('should add a new journey on custom journey button click', async () => {
    const push = jest.fn()
    mockUseRouter.mockReturnValue({ push } as unknown as NextRouter)
    mockUuidv4.mockReturnValueOnce(variables.journeyId)
    mockUuidv4.mockReturnValueOnce(variables.stepId)
    mockUuidv4.mockReturnValueOnce(variables.cardId)
    mockUuidv4.mockReturnValueOnce(variables.imageId)

    const { getByRole } = render(
      <MockedProvider mocks={mocks}>
        <TeamProvider>
          <OnboardingPanelContent />
        </TeamProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      fireEvent.click(getByRole('button', { name: 'Create Custom Journey' }))
    )

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
