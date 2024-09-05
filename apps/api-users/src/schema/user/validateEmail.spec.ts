// jest.mock('firebase-admin/auth', () => ({
//   __esModule: true,
//   getAuth: jest.fn().mockReturnValue({
// }))

import { queue } from '../../workers/email/queue'

describe('validateEmail', () => {
  it('should update user emailVerified', async () => {
    const userId = 'userId'
    const token = 'token'
    const email = 'email'
    const update = jest.fn()
    const getJob = jest.fn()
    const job = { data: { token } }
    getJob.mockReturnValueOnce(job)
    queue.getJob.mockReturnValueOnce(getJob)
    prisma.user.update.mockReturnValueOnce(update)
    await validateEmail(userId, token)
    expect(update).toHaveBeenCalledWith({
      where: { userId },
      data: { emailVerified: true }
    })
  })
})
