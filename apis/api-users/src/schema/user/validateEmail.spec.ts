import { getAuth } from 'firebase-admin/auth'
import { Mock, vi } from 'vitest'

import { prismaMock } from '../../../test/prismaMock'

import { validateEmail } from './validateEmail'

vi.mock('bullmq', () => ({
  __esModule: true,
  Queue: vi.fn().mockImplementation(() => ({
    add: vi.fn(),
    getJob: vi
      .fn()
      .mockImplementation((jobId: string) =>
        jobId === 'userId' ? { data: { token: 'token' } } : null
      )
  }))
}))

vi.mock('firebase-admin/auth', () => ({
  __esModule: true,
  getAuth: vi.fn().mockReturnValue({
    id: '1',
    userId: '1',
    createdAt: new Date('2021-01-01T00:00:00.000Z'),
    firstName: 'Amin',
    lastName: 'One',
    email: 'amin@email.com',
    imageUrl: 'https://bit.ly/3Gth4',
    emailVerified: false,
    updateUser: vi.fn()
  })
}))

describe('validateEmail', () => {
  const originalEnv = { ...process.env }

  afterEach(() => {
    vi.clearAllMocks()
    process.env = { ...originalEnv }
  })

  it('should return true', async () => {
    const userId = 'userId'
    const token = 'token'
    const userEmail = 'user@email.com'

    // Ensure $transaction executes the callback with the mocked client
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(prismaMock.$transaction as any).mockImplementation(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async (fn: (tx: typeof prismaMock) => Promise<unknown>) => {
        return await fn(prismaMock)
      }
    )

    prismaMock.user.update.mockResolvedValue({} as any)
    expect(await validateEmail(userId, userEmail, token)).toBe(true)
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { userId },
      data: { emailVerified: true }
    })
  })

  it('should return false', async () => {
    const userId = 'userId2'
    const token = 'token'
    const userEmail = 'user@email.com'

    expect(await validateEmail(userId, userEmail, token)).toBe(false)
    expect(prismaMock.user.update).not.toHaveBeenCalled()
  })

  it('should validate email for example.com emails', async () => {
    process.env.EXAMPLE_EMAIL_TOKEN = 'example-token'
    const userId = 'bypassUser'
    const userEmail = 'playwrightuser@example.com'
    const token = 'example-token'

    // Ensure $transaction executes the callback with the mocked client
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(prismaMock.$transaction as any).mockImplementation(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async (fn: (tx: typeof prismaMock) => Promise<unknown>) => {
        return await fn(prismaMock)
      }
    )

    const result = await validateEmail(userId, userEmail, token)
    expect(result).toBe(true)

    const updateUserMock = (getAuth as Mock).mock.results[0].value
      .updateUser as Mock

    expect(updateUserMock).toHaveBeenCalledWith('bypassUser', {
      emailVerified: true
    })
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { userId: 'bypassUser' },
      data: { emailVerified: true }
    })
  })
})
