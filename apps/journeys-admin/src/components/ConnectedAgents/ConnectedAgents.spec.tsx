import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'

import { ConnectedAgents } from './ConnectedAgents'

const authStateReady = vi.hoisted(() =>
  vi.fn(async (): Promise<void> => undefined)
)
const session = vi.hoisted(
  (): { ownerId: string | undefined; firebaseId: string | undefined } => ({
    ownerId: 'alice',
    firebaseId: 'alice'
  })
)
vi.mock('../../libs/auth', () => ({
  useAuth: () => ({ user: session.ownerId ? { id: session.ownerId } : null })
}))
vi.mock('../../libs/auth/firebase', () => ({
  getFirebaseAuth: () => ({
    authStateReady,
    currentUser: {
      get uid() {
        return session.firebaseId
      },
      getIdToken: async () => 'session-token'
    }
  })
}))
const connection = {
  id: 'connection-a',
  clientId: 'client-a',
  version: 7,
  mode: 'view',
  status: 'active',
  expiresAt: '2027-11-16T10:00:00.000Z',
  journeys: [
    { id: 'a', title: 'Selected A' },
    { id: 'b', title: null }
  ]
}

describe('ConnectedAgents', () => {
  beforeEach(() => {
    authStateReady.mockResolvedValue(undefined)
    session.ownerId = 'alice'
    session.firebaseId = 'alice'
  })

  afterEach(() => vi.unstubAllGlobals())

  it('waits for the browser session and shows current grant metadata without management controls for withdrawal', async () => {
    let ready!: () => void
    authStateReady.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        ready = resolve
      })
    )
    const fetchPage = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            csrf: 'csrf',
            connections: [
              connection,
              { ...connection, id: 'disconnected', status: 'disconnected' },
              { ...connection, id: 'pending', status: 'pending' }
            ],
            nextCursor: null
          })
        )
    )
    vi.stubGlobal('fetch', fetchPage)
    render(<ConnectedAgents issuer="https://auth.example" />)
    expect(fetchPage).not.toHaveBeenCalled()
    await act(async () => {
      ready()
    })
    expect((await screen.findAllByText('Client: client-a'))[0]).toBeVisible()
    expect(screen.getAllByText('Selected A')).toHaveLength(3)
    expect(
      screen.getAllByText('Journey b is not currently accessible.')
    ).toHaveLength(3)
    expect(
      screen.getByRole('button', { name: 'Renew connection disconnected' })
    ).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'Renew connection pending' })
    ).toBeDisabled()
    expect(
      screen.queryByRole('button', { name: 'Disconnect' })
    ).not.toBeInTheDocument()
  })

  it('previews shortening before an explicit version-bound approval and shows the final expiry', async () => {
    const requests: Array<{ url: string; body: Record<string, unknown> }> = []
    const estimatedExpiry = '2026-11-23T10:00:00.000Z'
    const finalExpiry = '2026-11-23T10:00:30.000Z'
    let approved = false
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init: RequestInit) => {
        const body = JSON.parse(init.body as string) as Record<string, unknown>
        requests.push({ url, body })
        if (url.endsWith('/approve')) approved = true
        return new Response(
          JSON.stringify(
            url.endsWith('/review')
              ? {
                  reviewToken: 'review-token',
                  duration: 'week',
                  previewExpiresAt: estimatedExpiry,
                  previousExpiresAt: connection.expiresAt,
                  version: 7
                }
              : url.endsWith('/approve')
                ? { expiresAt: finalExpiry }
                : {
                    csrf: 'csrf',
                    connections: [
                      approved
                        ? { ...connection, version: 8, expiresAt: finalExpiry }
                        : connection
                    ],
                    nextCursor: null
                  }
          )
        )
      })
    )
    render(<ConnectedAgents issuer="https://auth.example" />)
    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Renew connection connection-a'
      })
    )
    expect(screen.getByRole('combobox')).toHaveTextContent('One week')
    fireEvent.click(screen.getByRole('button', { name: 'Review renewal' }))
    expect(
      await screen.findByText(
        `If approved now, access expires at ${estimatedExpiry}. The chosen duration starts when the server accepts your approval.`
      )
    ).toBeVisible()
    expect(
      screen.getByText(
        'This duration shortens the current connection lifetime.'
      )
    ).toBeVisible()
    expect(requests.some((request) => request.url.endsWith('/approve'))).toBe(
      false
    )
    fireEvent.click(screen.getByRole('button', { name: 'Approve renewal' }))
    expect(
      await screen.findByText(
        /Connection renewed until 2026-11-23T10:00:30.000Z/
      )
    ).toBeVisible()
    expect(await screen.findByText(`Expires at ${finalExpiry}`)).toBeVisible()
    expect(screen.queryByText(/If approved now/)).not.toBeInTheDocument()
    expect(
      screen.queryByText(`Expires at ${connection.expiresAt}`)
    ).not.toBeInTheDocument()
    expect(
      requests.find((request) => request.url.endsWith('/approve'))?.body
    ).toEqual({
      csrf: 'csrf',
      expectedVersion: 7,
      clientId: 'client-a',
      reviewToken: 'review-token'
    })
  })

  it('requires another review after a stale or denied approval', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async (url: string) =>
          new Response(
            JSON.stringify(
              url.endsWith('/review')
                ? {
                    reviewToken: 'review',
                    previewExpiresAt: '2026-11-23T10:00:00.000Z',
                    previousExpiresAt: connection.expiresAt,
                    version: 7
                  }
                : { csrf: 'csrf', connections: [connection], nextCursor: null }
            ),
            { status: url.endsWith('/approve') ? 409 : 200 }
          )
      )
    )
    render(<ConnectedAgents issuer="https://auth.example" />)
    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Renew connection connection-a'
      })
    )
    fireEvent.click(screen.getByRole('button', { name: 'Review renewal' }))
    fireEvent.click(
      await screen.findByRole('button', { name: 'Approve renewal' })
    )
    expect(
      await screen.findByText(/Connection details changed or are unavailable/)
    ).toBeVisible()
    expect(
      screen.queryByRole('button', { name: 'Approve renewal' })
    ).not.toBeInTheDocument()
  })
})

describe('connection management boundaries', () => {
  beforeEach(() => {
    authStateReady.mockResolvedValue(undefined)
    session.ownerId = 'alice'
    session.firebaseId = 'alice'
  })

  afterEach(() => vi.unstubAllGlobals())

  it('does not load connections without an authenticated owner', async () => {
    session.ownerId = undefined
    const fetchPage = vi.fn()
    vi.stubGlobal('fetch', fetchPage)
    render(<ConnectedAgents issuer="https://auth.example" />)
    await act(async () => {
      await Promise.resolve()
    })
    expect(fetchPage).not.toHaveBeenCalled()
    expect(
      screen.queryByRole('button', { name: /Renew connection/ })
    ).not.toBeInTheDocument()
  })

  it('rejects a browser identity that differs from the server session', async () => {
    session.firebaseId = 'bob'
    const fetchPage = vi.fn()
    vi.stubGlobal('fetch', fetchPage)
    render(<ConnectedAgents issuer="https://auth.example" />)
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Connection details changed or are unavailable'
    )
    expect(fetchPage).not.toHaveBeenCalled()
  })

  it('discards a response if the browser identity changes during the request', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        session.firebaseId = 'bob'
        return new Response(
          JSON.stringify({
            csrf: 'csrf',
            connections: [connection],
            nextCursor: null
          })
        )
      })
    )
    render(<ConnectedAgents issuer="https://auth.example" />)
    expect(await screen.findByRole('alert')).toBeVisible()
    expect(screen.queryByText('Selected A')).not.toBeInTheDocument()
  })

  it('appends another page, then replaces the list on refresh and clears it on failure', async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            csrf: 'csrf',
            connections: [connection],
            nextCursor: 'cursor-a'
          })
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            csrf: 'csrf',
            connections: [
              {
                ...connection,
                id: 'connection-b',
                mode: 'edit',
                status: 'expired',
                credentialsPending: true
              }
            ],
            nextCursor: null
          })
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ csrf: 'csrf', connections: [], nextCursor: null })
        )
      )
      .mockResolvedValueOnce(new Response('{}', { status: 403 }))
    vi.stubGlobal('fetch', fetchPage)
    render(<ConnectedAgents issuer="https://auth.example" />)
    fireEvent.click(
      await screen.findByRole('button', { name: 'Load more connections' })
    )
    expect(await screen.findByText('Connection: connection-b')).toBeVisible()
    expect(screen.getByText('Connection: connection-a')).toBeVisible()
    expect(screen.getByText('View and edit drafts')).toBeVisible()
    expect(screen.getByText('Expired')).toBeVisible()
    expect(
      screen.getByText(
        'Reconnect from your agent to get new credentials for this connection.'
      )
    ).toBeVisible()
    expect(fetchPage.mock.calls[1]).toEqual([
      'https://auth.example/connections',
      expect.objectContaining({
        credentials: 'include',
        redirect: 'error',
        headers: {
          Authorization: 'Bearer session-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ after: 'cursor-a' })
      })
    ])
    fireEvent.click(screen.getByRole('button', { name: 'Refresh connections' }))
    expect(
      await screen.findByText('You have no connected agents.')
    ).toBeVisible()
    expect(
      screen.queryByText('Connection: connection-a')
    ).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Refresh connections' }))
    expect(await screen.findByRole('alert')).toBeVisible()
    expect(
      screen.queryByText('You have no connected agents.')
    ).not.toBeInTheDocument()
  })

  it('requires a fresh review after review failure or changing the chosen duration', async () => {
    const requests: Array<Record<string, unknown>> = []
    let reviews = 0
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init: RequestInit) => {
        requests.push(
          JSON.parse(init.body as string) as Record<string, unknown>
        )
        if (url.endsWith('/review')) {
          reviews++
          if (reviews === 1) return new Response('{}', { status: 409 })
          return new Response(
            JSON.stringify({
              reviewToken: 'review',
              version: 7,
              previewExpiresAt: '2028-01-01T00:00:00.000Z',
              previousExpiresAt: connection.expiresAt
            })
          )
        }
        return new Response(
          JSON.stringify({
            csrf: 'csrf',
            connections: [connection],
            nextCursor: null
          })
        )
      })
    )
    render(<ConnectedAgents issuer="https://auth.example" />)
    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Renew connection connection-a'
      })
    )
    fireEvent.click(screen.getByRole('button', { name: 'Review renewal' }))
    expect(await screen.findByRole('alert')).toBeVisible()
    expect(
      screen.queryByRole('button', { name: 'Approve renewal' })
    ).not.toBeInTheDocument()
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Review renewal' })
      ).toBeEnabled()
    )
    fireEvent.mouseDown(screen.getByRole('combobox'))
    fireEvent.click(await screen.findByRole('option', { name: 'One month' }))
    fireEvent.click(screen.getByRole('button', { name: 'Review renewal' }))
    expect(
      await screen.findByRole('button', { name: 'Approve renewal' })
    ).toBeVisible()
    expect(requests.at(-1)).toEqual({
      csrf: 'csrf',
      expectedVersion: 7,
      clientId: 'client-a',
      duration: 'month'
    })
    expect(
      screen.queryByText(
        'This duration shortens the current connection lifetime.'
      )
    ).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Change duration' }))
    expect(
      screen.queryByRole('button', { name: 'Approve renewal' })
    ).not.toBeInTheDocument()
    expect(screen.getByRole('combobox')).toHaveTextContent('One month')
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })
})
