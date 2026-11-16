import { act, fireEvent, render, screen } from '@testing-library/react'

import { ConnectedAgents } from './ConnectedAgents'

const authStateReady = vi.hoisted(() =>
  vi.fn(async (): Promise<void> => undefined)
)
vi.mock('../../libs/auth', () => ({
  useAuth: () => ({ user: { id: 'alice' } })
}))
vi.mock('../../libs/auth/firebase', () => ({
  getFirebaseAuth: () => ({
    authStateReady,
    currentUser: { uid: 'alice', getIdToken: async () => 'session-token' }
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
  beforeEach(() => authStateReady.mockResolvedValue(undefined))
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
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init: RequestInit) => {
        const body = JSON.parse(init.body as string) as Record<string, unknown>
        requests.push({ url, body })
        return new Response(
          JSON.stringify(
            url.endsWith('/review')
              ? {
                  reviewToken: 'review-token',
                  duration: 'week',
                  previewExpiresAt: '2026-11-23T10:00:00.000Z',
                  previousExpiresAt: connection.expiresAt,
                  version: 7
                }
              : url.endsWith('/approve')
                ? { expiresAt: '2026-11-23T10:00:05.000Z' }
                : { csrf: 'csrf', connections: [connection], nextCursor: null }
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
    expect(await screen.findByText(/2026-11-23T10:00:00.000Z/)).toBeVisible()
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
        /Connection renewed until 2026-11-23T10:00:05.000Z/
      )
    ).toBeVisible()
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
