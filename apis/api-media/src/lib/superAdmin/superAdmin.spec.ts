import { usersPrismaMock } from '../../../test/usersPrismaMock'
import type { Context } from '../../schema/builder'

import { contextIsSuperAdmin } from './superAdmin'

function authenticated(): Context {
  return {
    type: 'authenticated',
    user: { id: 'userId', firstName: 'Test', emailVerified: true },
    currentRoles: []
  }
}

function setSuperAdmin(superAdmin: boolean | null): void {
  usersPrismaMock.user.findUnique.mockResolvedValue(
    (superAdmin == null ? null : { superAdmin }) as Awaited<
      ReturnType<typeof usersPrismaMock.user.findUnique>
    >
  )
}

describe('contextIsSuperAdmin', () => {
  it('reads the superAdmin flag of the calling user from the users database', async () => {
    setSuperAdmin(true)

    expect(await contextIsSuperAdmin(authenticated())).toBe(true)
    expect(usersPrismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { userId: 'userId' },
      select: { superAdmin: true }
    })
  })

  it('is false for a user without the flag and for an unknown user', async () => {
    setSuperAdmin(false)
    expect(await contextIsSuperAdmin(authenticated())).toBe(false)

    setSuperAdmin(null)
    expect(await contextIsSuperAdmin(authenticated())).toBe(false)
  })

  it('is false without asking the database for a public or interop caller', async () => {
    expect(await contextIsSuperAdmin({ type: 'public' })).toBe(false)
    expect(usersPrismaMock.user.findUnique).not.toHaveBeenCalled()
  })

  it('looks the user up once per request', async () => {
    setSuperAdmin(true)
    const context = authenticated()

    await contextIsSuperAdmin(context)
    await contextIsSuperAdmin(context)

    expect(usersPrismaMock.user.findUnique).toHaveBeenCalledTimes(1)
  })

  it('fails closed when the users database cannot be reached', async () => {
    usersPrismaMock.user.findUnique.mockRejectedValue(new Error('db down'))

    expect(await contextIsSuperAdmin(authenticated())).toBe(false)
  })
})
