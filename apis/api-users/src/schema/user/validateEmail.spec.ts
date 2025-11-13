import { getAuth } from 'firebase-admin/auth'

import { prismaMock } from '../../../test/prismaMock'

import { validateEmail } from './validateEmail'

jest.mock('bullmq', () => ({
  __esModule: true,
  Queue: jest.fn().mockImplementation(() => ({
    add: jest.fn(),
    getJob: jest
      .fn()
      .mockImplementation((jobId: string) =>
        jobId === 'userId' ? { data: { token: 'token' } } : null
      )
  }))
}))

jest.mock('firebase-admin/auth', () => ({
  __esModule: true,
  getAuth: jest.fn().mockReturnValue({
    id: '1',
    userId: '1',
    createdAt: new Date('2021-01-01T00:00:00.000Z'),
    firstName: 'Amin',
    lastName: 'One',
    email: 'amin@email.com',
    imageUrl: 'https://bit.ly/3Gth4',
    emailVerified: false,
    updateUser: jest.fn()
  })
}))

describe('validateEmail', () => {
  const originalEnv = { ...process.env }

  afterEach(() => {
    jest.clearAllMocks()
    process.env = { ...originalEnv }
  })

  it('should return true', async () => {
    const userId = 'userId'
    const token = 'token'
    const userEmail = 'user@email.com'

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

    const result = await validateEmail(userId, userEmail, token)
    expect(result).toBe(true)

    const updateUserMock = (getAuth as jest.Mock).mock.results[0].value
      .updateUser as jest.Mock

    expect(updateUserMock).toHaveBeenCalledWith('bypassUser', {
      emailVerified: true
    })
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { userId: 'bypassUser' },
      data: { emailVerified: true }
    })
  })
})
