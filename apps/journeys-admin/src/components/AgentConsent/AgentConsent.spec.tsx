import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'

import { AgentConsent } from './AgentConsent'

const authStateReady = vi.hoisted(() =>
  vi.fn(async (): Promise<void> => undefined)
)

vi.mock('../../libs/auth', () => ({
  useAuth: () => ({ user: { id: 'alice' } })
}))
vi.mock('../../libs/auth/firebase', () => ({
  getFirebaseAuth: () => ({
    authStateReady,
    currentUser: { uid: 'alice', getIdToken: async () => 'firebase-evidence' }
  })
}))

describe('AgentConsent', () => {
  beforeEach(() => authStateReady.mockResolvedValue(undefined))

  afterEach(() => {
    vi.unstubAllGlobals()
    authStateReady.mockReset()
  })

  it('waits for Firebase client-session hydration before requesting consent details', async () => {
    let resolve!: () => void
    authStateReady.mockReturnValueOnce(
      new Promise<void>((ready) => {
        resolve = ready
      })
    )
    const fetchDetails = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            clientName: 'Synthetic agent',
            clientId: 'client-a',
            redirectUri: 'https://client.example/callback',
            csrf: 'synthetic-csrf',
            journeys: [{ id: 'draft-a', title: 'Draft A', canEdit: true }]
          })
        )
    )
    vi.stubGlobal('fetch', fetchDetails)
    render(
      <AgentConsent issuer="https://auth.example" interaction="hydrating" />
    )
    await act(async () => {
      await Promise.resolve()
    })
    expect(fetchDetails).not.toHaveBeenCalled()
    await act(async () => {
      resolve()
    })
    expect(await screen.findByText('Draft A')).toBeVisible()
  })

  it('defaults to a week, reviews selected journeys and displays the exact server expiry before approval', async () => {
    const requests: Array<{ url: string; body: Record<string, unknown> }> = []
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init: RequestInit) => {
        requests.push({
          url,
          body: JSON.parse(init.body as string) as Record<string, unknown>
        })
        return new Response(
          JSON.stringify(
            url.endsWith('/details')
              ? {
                  clientName: 'Synthetic agent',
                  clientId: 'client-a',
                  redirectUri: 'https://client.example/callback',
                  csrf: 'synthetic-csrf',
                  journeys: [
                    { id: 'draft-a', title: 'Draft A', canEdit: true },
                    { id: 'draft-b', title: 'Draft B', canEdit: true }
                  ]
                }
              : {
                  reviewToken: 'server-review',
                  expiresAt: '2027-01-31T14:15:16.000Z',
                  mode: 'edit',
                  duration: 'week',
                  journeyIds: ['draft-a']
                }
          ),
          { status: 200 }
        )
      })
    )
    render(
      <AgentConsent issuer="https://auth.example" interaction="interaction-a" />
    )
    fireEvent.click(await screen.findByRole('checkbox', { name: 'Draft A' }))
    expect(screen.getByRole('combobox')).toHaveTextContent('One week')
    fireEvent.click(screen.getByRole('button', { name: 'Review connection' }))
    expect(await screen.findByText(/2027-01-31T14:15:16.000Z/)).toBeVisible()
    expect(
      screen.getByRole('button', { name: 'Approve connection' })
    ).toBeEnabled()
    expect(requests[1].body).toEqual({
      csrf: 'synthetic-csrf',
      journeyIds: ['draft-a'],
      mode: 'edit',
      duration: 'week'
    })
    expect(requests).toHaveLength(2)
  })

  it('does not offer approval when the server rejects consent review', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async (url: string) =>
          new Response(
            JSON.stringify(
              url.endsWith('/details')
                ? {
                    clientName: 'Synthetic agent',
                    clientId: 'client-a',
                    redirectUri: 'https://client.example/callback',
                    csrf: 'synthetic-csrf',
                    journeys: [
                      { id: 'draft-a', title: 'Draft A', canEdit: true }
                    ]
                  }
                : { error: 'request_denied' }
            ),
            { status: url.endsWith('/details') ? 200 : 403 }
          )
      )
    )
    render(
      <AgentConsent issuer="https://auth.example" interaction="interaction-b" />
    )
    fireEvent.click(await screen.findByRole('checkbox', { name: 'Draft A' }))
    fireEvent.click(screen.getByRole('button', { name: 'Review connection' }))
    await waitFor(() => expect(screen.getByRole('alert')).toBeVisible())
    expect(
      screen.queryByRole('button', { name: 'Approve connection' })
    ).not.toBeInTheDocument()
  })

  it('reconnects a renewed identity without allowing its access or expiry to change', async () => {
    const requests: Array<Record<string, unknown>> = []
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init: RequestInit) => {
        requests.push(
          JSON.parse(init.body as string) as Record<string, unknown>
        )
        return new Response(
          JSON.stringify(
            url.endsWith('/details')
              ? {
                  clientName: 'Agent',
                  clientId: 'client-a',
                  redirectUri: 'https://client.example/callback',
                  csrf: 'csrf',
                  journeys: [
                    { id: 'draft-a', title: 'Draft A', canEdit: true }
                  ],
                  reconnectableConnections: [
                    {
                      id: 'renewed-connection',
                      version: 4,
                      journeyIds: ['draft-a'],
                      mode: 'view',
                      expiresAt: '2027-01-01T00:00:00.000Z'
                    }
                  ]
                }
              : {
                  reviewToken: 'review',
                  reconnect: true,
                  expiresAt: '2027-01-01T00:00:00.000Z',
                  mode: 'view',
                  duration: 'week',
                  journeyIds: ['draft-a']
                }
          )
        )
      })
    )
    render(
      <AgentConsent issuer="https://auth.example" interaction="reconnect" />
    )
    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Reconnect connection renewed-connection'
      })
    )
    expect(screen.getByRole('checkbox', { name: 'Draft A' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Draft A' })).toBeDisabled()
    expect(screen.getByRole('radio', { name: 'View only' })).toBeChecked()
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-disabled',
      'true'
    )
    fireEvent.click(screen.getByRole('button', { name: 'Review connection' }))
    expect(await screen.findByText(/2027-01-01T00:00:00.000Z/)).toBeVisible()
    expect(requests[1]).toMatchObject({
      connectionId: 'renewed-connection',
      expectedVersion: 4,
      journeyIds: ['draft-a'],
      mode: 'view'
    })
    fireEvent.click(screen.getByRole('button', { name: 'Change selection' }))
    fireEvent.click(
      screen.getByRole('button', { name: 'Create a separate connection' })
    )
    expect(screen.getByRole('checkbox', { name: 'Draft A' })).toBeEnabled()
    expect(screen.getByRole('checkbox', { name: 'Draft A' })).not.toBeChecked()
    expect(screen.getByRole('combobox')).not.toHaveAttribute(
      'aria-disabled',
      'true'
    )
    expect(
      screen.getByRole('button', { name: 'Review connection' })
    ).toBeDisabled()
    fireEvent.click(screen.getByRole('checkbox', { name: 'Draft A' }))
    fireEvent.click(screen.getByRole('button', { name: 'Review connection' }))
    await screen.findByRole('button', { name: 'Approve connection' })
    expect(requests[2]).not.toHaveProperty('connectionId')
    expect(requests[2]).not.toHaveProperty('expectedVersion')
  })
})
