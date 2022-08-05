import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { NextRouter, useRouter } from 'next/router'
import { GetJourney_journey as Journey } from '../../../../../__generated__/GetJourney'
import {
  CreateTemplateMenuItem,
  DUPLICATE_JOURNEY,
  CREATE_TEMPLATE
} from './CreateTemplateMenuItem'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('Create Template', () => {
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
              query: DUPLICATE_JOURNEY,
              variables: {
                id: 'journeyId'
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
          }
        ]}
      >
        <JourneyProvider
          value={{
            journey: { id: 'journeyId' } as unknown as Journey,
            admin: true
          }}
        >
          <CreateTemplateMenuItem />
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('menuitem', { name: 'Create Template' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        '/journeys/templates/templateId',
        undefined,
        { shallow: true }
      )
    })
  })
})
