import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import { JOURNEY_DUPLICATE } from '../../../../../libs/useJourneyDuplicateMutation'

import {
  CREATE_TEMPLATE,
  CreateTemplateMenuItem,
  REMOVE_USER_JOURNEY
} from './CreateTemplateMenuItem'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('CreateTemplateMenuItem', () => {
  it('should create a template on menu card click', async () => {
    const push = jest.fn()
    mockUseRouter.mockReturnValue({ push } as unknown as NextRouter)
    const result = jest.fn(() => {
      return {
        data: {
          journeyTemplate: {
            id: 'templateId',
            template: true
          }
        }
      }
    })
    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_DUPLICATE,
              variables: {
                id: 'journeyId',
                teamId: 'jfp-team'
              }
            },
            result: {
              data: {
                journeyDuplicate: {
                  id: 'duplicatedJourneyId'
                }
              }
            }
          },
          {
            request: {
              query: CREATE_TEMPLATE,
              variables: {
                id: 'duplicatedJourneyId',
                input: {
                  template: true
                }
              }
            },
            result
          },
          {
            request: {
              query: REMOVE_USER_JOURNEY,
              variables: {
                id: 'templateId'
              }
            },
            result: {
              data: {
                userJourneyRemoveAll: {
                  id: 'journeyId'
                }
              }
            }
          }
        ]}
      >
        <JourneyProvider
          value={{
            journey: { id: 'journeyId' } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <CreateTemplateMenuItem isVisible />
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('menuitem', { name: 'Create Template' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/publisher/templateId', undefined, {
        shallow: true
      })
    })
  })
})
