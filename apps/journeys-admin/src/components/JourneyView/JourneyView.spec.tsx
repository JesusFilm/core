import { render } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { SnackbarProvider } from 'notistack'
import { JourneyProvider } from '../../libs/context'
import { GetJourney_journey as Journey } from '../../../__generated__/GetJourney'
import { JourneyView } from '.'

describe('JourneyView', () => {
  it('should have edit button', () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider
            value={
              {
                id: 'journeyId',
                slug: 'my-journey',
                title: 'title',
                description: 'description',
                createdAt: '2021-11-19T12:34:56.647Z',
                blocks: []
              } as unknown as Journey
            }
          >
            <JourneyView />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByRole('link', { name: 'Edit' })).toHaveAttribute(
      'href',
      '/journeys/my-journey/edit'
    )
  })
})
