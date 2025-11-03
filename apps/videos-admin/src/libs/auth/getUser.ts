import { cookies } from 'next/headers'
import { Tokens, getTokens } from 'next-firebase-auth-edge'
import { filterStandardClaims } from 'next-firebase-auth-edge/lib/auth/claims'

import { User } from './authContext'
import { authConfig } from './config'

const toUser = ({ decodedToken, token }: Tokens): User => {
  const {
    uid,
    email,
    picture: photoURL,
    email_verified: emailVerified,
    phone_number: phoneNumber,
    name: displayName,
    source_sign_in_provider: signInProvider
  } = decodedToken

  const customClaims = filterStandardClaims(decodedToken)

  return {
    uid,
    email: email ?? null,
    displayName: displayName ?? null,
    photoURL: photoURL ?? null,
    phoneNumber: phoneNumber ?? null,
    emailVerified: emailVerified ?? false,
    providerId: signInProvider,
    customClaims,
    token
  }
}

export async function getUser(): Promise<User | null> {
  const tokens = await getTokens(await cookies(), authConfig)
  return tokens != null ? toUser(tokens) : null
}
