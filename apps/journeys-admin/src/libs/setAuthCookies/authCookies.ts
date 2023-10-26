import { authConfig } from '../firebaseClient/initAuth'

export const getUserCookieName = (): string => {
  return `${authConfig.cookies.name}.AuthUser` // do not modify
}

export const getUserSigCookieName = (): string => `${getUserCookieName()}.sig`

export const getUserTokensCookieName = (): string => {
  return `${authConfig.cookies.name}.AuthUserTokens` // do not modify
}

export const getUserTokensSigCookieName = (): string =>
  `${getUserTokensCookieName()}.sig`
