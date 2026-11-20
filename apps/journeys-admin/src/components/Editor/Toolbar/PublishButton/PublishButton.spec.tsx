import { MockedProvider } from '@apollo/client/testing/react'
import { fireEvent, render, screen } from '@testing-library/react'
import { GraphQLError } from 'graphql'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { journey as fixture } from '@core/journeys/ui/JourneyProvider/JourneyProvider.mock'

import {
  GET_JOURNEY_PUBLISH_PERMISSION,
  PUBLISH_DRAFT_JOURNEY,
  PublishButton
} from './PublishButton'

describe('ordinary human Publish', () => {
  it('shows Publish only with current Manage permission and invokes the ordinary mutation', async () => {
    const published = vi.fn(() => ({
      data: {
        journeyPublish: {
          __typename: 'Journey',
          id: fixture.id,
          status: 'published',
          publishedAt: '2026-11-20T00:00:00Z'
        }
      }
    }))
    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_JOURNEY_PUBLISH_PERMISSION,
              variables: { id: fixture.id }
            },
            result: { data: { journeyPublishPermission: true } }
          },
          {
            request: {
              query: PUBLISH_DRAFT_JOURNEY,
              variables: { id: fixture.id }
            },
            result: published
          }
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider value={{ journey: fixture }}>
            <PublishButton />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.click(await screen.findByRole('button', { name: /^Publish$/ }))
    await screen.findByText('Journey published')
    expect(published).toHaveBeenCalledOnce()
  })

  it('hides Publish from a journey-only Editor', async () => {
    const permission = vi.fn(() => ({
      data: { journeyPublishPermission: false }
    }))
    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_JOURNEY_PUBLISH_PERMISSION,
              variables: { id: fixture.id }
            },
            result: permission
          }
        ]}
      >
        <JourneyProvider value={{ journey: fixture }}>
          <PublishButton />
        </JourneyProvider>
      </MockedProvider>
    )
    await vi.waitFor(() => expect(permission).toHaveBeenCalledOnce())
    expect(
      screen.queryByRole('button', { name: 'Publish' })
    ).not.toBeInTheDocument()
  })

  it('reports current-rights rejection without a success notice', async () => {
    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_JOURNEY_PUBLISH_PERMISSION,
              variables: { id: fixture.id }
            },
            result: { data: { journeyPublishPermission: true } }
          },
          {
            request: {
              query: PUBLISH_DRAFT_JOURNEY,
              variables: { id: fixture.id }
            },
            result: {
              errors: [new GraphQLError('current Manage permission removed')]
            }
          }
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider value={{ journey: fixture }}>
            <PublishButton />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.click(await screen.findByRole('button', { name: /^Publish$/ }))
    await screen.findByText(
      'Unable to publish. Check your current access and try again.'
    )
    expect(screen.queryByText('Journey published')).not.toBeInTheDocument()
  })
})
