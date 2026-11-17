import { firebaseIdentity } from './identity'

const controlled = vi.hoisted(() => ({
  getUser: vi.fn(),
  verifyIdToken: vi.fn()
}))
vi.mock('firebase-admin/app', () => ({ cert: vi.fn(), initializeApp: vi.fn() }))
vi.mock('firebase-admin/auth', () => ({ getAuth: () => controlled }))

describe('fresh external account eligibility', () => {
  const evidence = {
    userId: 'alice',
    authTime: 100,
    createdAt: '1970-01-01T00:00:00.000Z'
  }
  const account = {
    disabled: false,
    email: 'synthetic@example.com',
    emailVerified: true,
    metadata: { creationTime: evidence.createdAt },
    tokensValidAfterTime: '1970-01-01T00:00:00.000Z'
  }
  beforeEach(() => {
    vi.resetAllMocks()
    vi.stubEnv(
      'GOOGLE_APPLICATION_JSON',
      JSON.stringify({
        project_id: 'controlled',
        client_email: 'local@example.com',
        private_key: 'controlled-key'
      })
    )
    controlled.getUser.mockResolvedValue(account)
  })
  afterEach(() => vi.unstubAllEnvs())

  it.each([
    { disabled: true },
    { emailVerified: false },
    { email: undefined },
    { metadata: { creationTime: '2026-01-01T00:00:00.000Z' } },
    { tokensValidAfterTime: '1970-01-01T00:01:41.000Z' }
  ])(
    'denies new authority after external eligibility changes',
    async (changed) => {
      const identity = firebaseIdentity({
        AUTH_FIREBASE_PROJECT_ID: 'controlled'
      })
      await identity.check(evidence)
      controlled.getUser.mockResolvedValue({ ...account, ...changed })
      await expect(identity.check(evidence)).rejects.toThrow(
        'Identity ineligible'
      )
      expect(controlled.getUser).toHaveBeenCalledTimes(2)
      expect(controlled.getUser).toHaveBeenLastCalledWith('alice')
    }
  )

  it('fails closed on deletion or unavailable Firebase without reusing a prior allow', async () => {
    const identity = firebaseIdentity({
      AUTH_FIREBASE_PROJECT_ID: 'controlled'
    })
    await identity.check(evidence)
    controlled.getUser.mockRejectedValue(
      new Error('controlled provider outage')
    )
    await expect(identity.check(evidence)).rejects.toThrow(
      'controlled provider outage'
    )
  })

  it('binds authentication to verified non-anonymous sign-in and current revocation state', async () => {
    const identity = firebaseIdentity({
      AUTH_FIREBASE_PROJECT_ID: 'controlled'
    })
    controlled.verifyIdToken.mockResolvedValue({
      uid: 'alice',
      aud: 'controlled',
      email_verified: true,
      auth_time: 100,
      firebase: { sign_in_provider: 'password' }
    })
    expect(await identity.authenticate('controlled-token')).toEqual(evidence)
    expect(controlled.verifyIdToken).toHaveBeenCalledWith(
      'controlled-token',
      true
    )
    controlled.getUser.mockResolvedValue({
      ...account,
      tokensValidAfterTime: '1970-01-01T00:01:41.000Z'
    })
    await expect(identity.authenticate('controlled-token')).rejects.toThrow(
      'Identity ineligible'
    )
  })
})
