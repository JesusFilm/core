import { NextApiRequest, NextApiResponse } from 'next'

import { authConfig } from '../../src/libs/auth/config'

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse
): void {
  res.setHeader(
    'Set-Cookie',
    `${authConfig.cookieName}=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax`
  )
  res.redirect(307, '/users/sign-in')
}
