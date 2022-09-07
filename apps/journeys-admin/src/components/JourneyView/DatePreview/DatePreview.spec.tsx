import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { NextRouter, useRouter } from 'next/router'
import { publishedJourney } from '../data'
import { DatePreview } from './DatePreview'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('DatePreview', () => {
  it('should have template date and the preview button', async () => {
    const push = jest.fn()
    mockUseRouter.mockReturnValue({ push } as unknown as NextRouter)
    const { getByText, getByRole } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: {
              ...publishedJourney,
              slug: 'template-slug',
              template: true
            }
          }}
        >
          <DatePreview />
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByText('November 19, 2021')).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Preview' }))
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/api/preview?slug=template-slug')
    })
  })
})
