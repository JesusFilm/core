import { NextApiRequest, NextApiResponse } from 'next'

import { authConfig } from '../../src/libs/auth/config'

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse
): void {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  const base = `Path=/; HttpOnly; Max-Age=0; SameSite=Lax${secure}`
  res.setHeader('Set-Cookie', [
    `${authConfig.cookieName}=; ${base}`,
    `${authConfig.cookieName}.sig=; ${base}`
  ])
  res.redirect(307, '/users/sign-in')
}
