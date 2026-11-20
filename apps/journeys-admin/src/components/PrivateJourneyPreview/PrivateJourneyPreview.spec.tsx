import { InMemoryCache } from '@apollo/client'
import { MockLink } from '@apollo/client/testing'
import { MockedProvider } from '@apollo/client/testing/react'
import { sendGTMEvent } from '@next/third-parties/google'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { GraphQLError } from 'graphql'
import { SnackbarProvider } from 'notistack'

import { blockHistoryVar } from '@core/journeys/ui/block'
import type { JourneyFields } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'
import { journey as fixture } from '@core/journeys/ui/JourneyProvider/JourneyProvider.mock'

import { AuthContext, User } from '../../libs/auth/authContext'

import {
  GET_PRIVATE_JOURNEY_PREVIEW,
  PrivateJourneyPreview
} from './PrivateJourneyPreview'

const { router, plausible } = vi.hoisted(() => ({
  router: {
    query: {},
    pathname: '/journeys/[journeyId]/preview',
    replace: vi.fn()
  },
  plausible: vi.fn()
}))
vi.mock('next/router', () => ({ useRouter: () => router }))
vi.mock('next-plausible', () => ({ usePlausible: () => plausible }))
vi.mock('@next/third-parties/google', () => ({ sendGTMEvent: vi.fn() }))
const user = { id: 'alice', isAnonymous: false } as User
const blocks = [
  {
    __typename: 'StepBlock',
    id: 'start',
    parentBlockId: null,
    parentOrder: 0,
    nextBlockId: 'default',
    locked: false
  },
  {
    __typename: 'CardBlock',
    id: 'start-card',
    parentBlockId: 'start',
    parentOrder: 0
  },
  {
    __typename: 'RadioOptionBlock',
    id: 'answer',
    parentBlockId: 'question',
    parentOrder: 0,
    label: 'Answer branch',
    submitEnabled: false,
    action: { __typename: 'NavigateToBlockAction', blockId: 'answer-step' }
  },
  {
    __typename: 'RadioQuestionBlock',
    id: 'question',
    parentBlockId: 'start-card',
    parentOrder: 0,
    gridView: false
  },
  {
    __typename: 'ButtonBlock',
    id: 'external',
    parentBlockId: 'start-card',
    parentOrder: 1,
    label: 'External link',
    submitEnabled: false,
    action: {
      __typename: 'LinkAction',
      url: 'https://example.com',
      target: '_blank'
    }
  },
  {
    __typename: 'TextResponseBlock',
    id: 'email',
    parentBlockId: 'start-card',
    parentOrder: 2,
    label: 'Contact email',
    type: 'email',
    required: false,
    routeId: 'protected-route',
    integrationId: 'protected-integration'
  },
  {
    __typename: 'ButtonBlock',
    id: 'submit',
    parentBlockId: 'start-card',
    parentOrder: 3,
    label: 'Submit preview form',
    submitEnabled: true,
    action: null
  },
  ...['default', 'answer-step'].flatMap((id, index) => [
    {
      __typename: 'StepBlock',
      id,
      parentBlockId: null,
      parentOrder: index + 1,
      nextBlockId: null,
      locked: false
    },
    {
      __typename: 'CardBlock',
      id: `${id}-card`,
      parentBlockId: id,
      parentOrder: 0
    },
    {
      __typename: 'TypographyBlock',
      id: `${id}-text`,
      parentBlockId: `${id}-card`,
      parentOrder: 0,
      content: `${id} saved content`,
      variant: 'h1'
    }
  ])
] as JourneyFields['blocks']
const journey = { ...fixture, blocks }

describe('private saved playback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    blockHistoryVar([])
    router.query = {}
  })

  function preview(website = false) {
    const link = new MockLink([
      {
        request: {
          query: GET_PRIVATE_JOURNEY_PREVIEW,
          variables: { id: fixture.id }
        },
        result: { data: { journey: { ...journey, website } } }
      }
    ])
    const requests = vi.spyOn(link, 'request')
    const view = render(
      <MockedProvider link={link}>
        <AuthContext.Provider value={{ user }}>
          <SnackbarProvider>
            <PrivateJourneyPreview journeyId={fixture.id} />
          </SnackbarProvider>
        </AuthContext.Provider>
      </MockedProvider>
    )
    return { ...view, requests }
  }

  it('follows answer and default branches without visitor, analytics or external actions', async () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)
    const { requests } = preview()
    fireEvent.click(
      await screen.findByRole('button', { name: 'External link' })
    )
    expect(open).not.toHaveBeenCalled()
    fireEvent.change(screen.getByRole('textbox', { name: 'Contact email' }), {
      target: { value: 'synthetic@example.com' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Submit preview form' }))
    await waitFor(() =>
      expect(
        screen.getByRole('textbox', { name: 'Contact email' })
      ).toHaveValue('synthetic@example.com')
    )
    fireEvent.click(screen.getByRole('button', { name: 'Answer branch' }))
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'answer-step saved content' })
      ).toBeVisible()
    )
    fireEvent.click(screen.getByRole('button', { name: 'Previous' }))
    await screen.findByRole('button', { name: 'Answer branch' })
    fireEvent.click(screen.getByRole('button', { name: /^Next$/ }))
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'default saved content' })
      ).toBeVisible()
    )
    expect(plausible).not.toHaveBeenCalled()
    expect(sendGTMEvent).not.toHaveBeenCalled()
    expect(
      requests.mock.calls.map(([operation]) => operation.operationName)
    ).toEqual(['GetPrivateJourneyPreview'])
    expect(screen.getByRole('link', { name: 'Open in Admin' })).toHaveAttribute(
      'href',
      `/journeys/${fixture.id}`
    )
    open.mockRestore()
  })

  it('routes website cards inside private Admin playback', async () => {
    preview(true)
    fireEvent.click(
      await screen.findByRole('button', { name: 'Answer branch' })
    )
    await waitFor(() =>
      expect(router.replace).toHaveBeenCalledWith(
        expect.objectContaining({
          pathname: '/journeys/[journeyId]/preview',
          query: { stepId: 'answer-step' }
        }),
        undefined,
        { shallow: true }
      )
    )
    expect(plausible).not.toHaveBeenCalled()
  })

  it('denies a warmed Apollo result when the current network read is rejected', async () => {
    const cache = new InMemoryCache()
    cache.writeQuery({
      query: GET_PRIVATE_JOURNEY_PREVIEW,
      variables: { id: fixture.id },
      data: { journey: { ...journey, title: 'private-cache-sentinel' } }
    })
    render(
      <MockedProvider
        cache={cache}
        mocks={[
          {
            request: {
              query: GET_PRIVATE_JOURNEY_PREVIEW,
              variables: { id: fixture.id }
            },
            result: { errors: [new GraphQLError('denied')] }
          }
        ]}
      >
        <AuthContext.Provider value={{ user }}>
          <PrivateJourneyPreview journeyId={fixture.id} />
        </AuthContext.Provider>
      </MockedProvider>
    )
    expect(screen.queryByText('private-cache-sentinel')).not.toBeInTheDocument()
    await screen.findByText(/Preview unavailable/)
    expect(screen.queryByTestId('Conductor')).not.toBeInTheDocument()
  })

  it('gives a signed-out user no saved playback', () => {
    render(
      <MockedProvider>
        <AuthContext.Provider value={{ user: null }}>
          <PrivateJourneyPreview journeyId={fixture.id} />
        </AuthContext.Provider>
      </MockedProvider>
    )
    expect(screen.getByText(/Preview unavailable/)).toBeInTheDocument()
    expect(screen.queryByTestId('Conductor')).not.toBeInTheDocument()
  })
})
