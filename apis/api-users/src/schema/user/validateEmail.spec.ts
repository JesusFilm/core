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
  it('should return true', async () => {
    const userId = 'userId'
    const token = 'token'
    prismaMock.user.update.mockImplementation()
    expect(await validateEmail(userId, token)).toBe(true)
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { userId },
      data: { emailVerified: true }
    })
  })

  it('should return false', async () => {
    const userId = 'userId2'
    const token = 'token'

    expect(await validateEmail(userId, token)).toBe(false)
    expect(prismaMock.user.update).not.toHaveBeenCalled()
  })
})
