import { fireEvent, render, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { v4 as uuidv4 } from 'uuid'
import { NextRouter, useRouter } from 'next/router'
import {
  data,
  variables
} from '../../../../libs/useJourneyCreate/useJourneyCreate.spec'
import { CREATE_JOURNEY } from '../../../../libs/useJourneyCreate'
import { AddJourneyButton } from '.'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('AddJourneyButton', () => {
  it('should create a journey and redirect to edit page on click', async () => {
    mockUuidv4.mockReturnValueOnce(variables.journeyId)
    mockUuidv4.mockReturnValueOnce(variables.stepId)
    mockUuidv4.mockReturnValueOnce(variables.cardId)
    mockUuidv4.mockReturnValueOnce(variables.imageId)

    const push = jest.fn()
    mockUseRouter.mockReturnValue({ push } as unknown as NextRouter)

    const result = jest.fn(() => ({ data }))
    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: CREATE_JOURNEY,
              variables
            },
            result
          }
        ]}
      >
        <AddJourneyButton />
      </MockedProvider>
    )

    expect(
      getByRole('button', { name: 'Create a Journey' })
    ).toBeInTheDocument()

    fireEvent.click(getByRole('button', { name: 'Create a Journey' }))

    await waitFor(() =>
      expect(push).toHaveBeenCalledWith(
        `/journeys/${data.journeyCreate.id}/edit`,
        undefined,
        { shallow: true }
      )
    )
  })
})
