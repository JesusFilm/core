import { cookies } from '../firebaseClient/initAuth'

export const getUserCookieName = (): string => {
  return `${cookies.name}.AuthUser` // do not modify
}

export const getUserSigCookieName = (): string => `${getUserCookieName()}.sig`

export const getUserTokensCookieName = (): string => {
  return `${cookies.name}.AuthUserTokens` // do not modify
}

export const getUserTokensSigCookieName = (): string =>
  `${getUserTokensCookieName()}.sig`
