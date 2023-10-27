// https://github.com/gladly-team/next-firebase-auth/blob/v1.x/src/cookies.ts
import Cookies from 'cookies'
import { GetServerSidePropsContext } from 'next'
import { NextRequest, NextResponse } from 'next/server'

import { decodeBase64, encodeBase64 } from './encoding'

interface ReqResObj {
  req: NextRequest | GetServerSidePropsContext['req']
  res?: NextResponse | GetServerSidePropsContext['res']
}

interface ReqResOptionalObj {
  req: NextRequest | GetServerSidePropsContext['req']
  res?: NextResponse | GetServerSidePropsContext['res']
}

type CookieOptions = Omit<Cookies.Option & Cookies.SetOption, 'sameSite'> & {
  sameSite?: string
}

// const createCookieMgr = (
//   { req, res }: ReqResObj,
//   {
//     keys,
//     secure
//   }: { keys?: Cookies.Option['keys']; secure?: Cookies.Option['secure'] } = {}
// ): Cookies => {
//   // https://github.com/pillarjs/cookies
//   const cookies = Cookies(req, res, {
//     keys,
//     secure
//   })
//   return cookies
// }

export const getCookie = (
  name: string,
  // The request object is mandatory. The response object is optional.
  {
    req
  }: // The "cookies" package still interacts with the response object when
  // initializing. As a convenience, default to a minimal response object
  // that avoids unhelpful "cookies" errors when a response object is not
  // provided.
  // https://github.com/pillarjs/cookies/blob/master/index.js
  // res = {} as unknown as NextResponse
  ReqResOptionalObj,
  {
    keys,
    secure,
    signed = false
  }: {
    keys?: Cookies.Option['keys']
    secure?: Cookies.Option['secure']
    signed?: Cookies.SetOption['signed']
  } = {}
): any => {
  if (signed != null) {
    const areCookieKeysDefined = Array.isArray(keys)
      ? keys.length > 0 &&
        (keys.filter != null
          ? keys.filter((item) => item !== undefined).length
          : true)
      : Boolean(keys)
    if (areCookieKeysDefined == null) {
      throw new Error(
        'The "keys" value must be provided when using signed cookies.'
      )
    }
  }
  if (req == null) {
    throw new Error('The "req" argument is required when calling `getCookie`.')
  }

  // const cookies = createCookieMgr({ req, res }, { keys, secure })

  // https://github.com/pillarjs/cookies#cookiesget-name--options--
  const cookieVal = req.cookies.get(name, { signed })?.value
  return cookieVal != null ? decodeBase64(cookieVal) : undefined
}

export const setCookie = (
  name: string,
  cookieVal: string | undefined,
  // The response object is mandatory. The request is optional and unused.
  { res }: ReqResObj,
  {
    keys,
    domain,
    httpOnly,
    maxAge,
    overwrite,
    path,
    sameSite,
    secure,
    signed
  }: CookieOptions = {}
): void => {
  if (signed != null && keys == null) {
    throw new Error(
      'The "keys" value must be provided when using signed cookies.'
    )
  }
  if (res == null) {
    throw new Error('The "res" argument is required when calling `setCookie`.')
  }

  // const cookies = createCookieMgr({ req, res }, { keys, secure })

  // If the value is not defined, set the value to undefined
  // so that the cookie will be deleted.
  const valToSet = cookieVal == null ? undefined : encodeBase64(cookieVal)

  // https://github.com/pillarjs/cookies#cookiesset-name--value---options--
  res.cookies.set(name, valToSet, {
    domain,
    httpOnly,
    maxAge,
    overwrite,
    path,
    // Prefer explicit sameSite string instead of boolean.
    sameSite: sameSite as Cookies.SetOption['sameSite'],
    secure,
    signed
  })
}

// Some options, like path and domain, must match those used when setting
// the cookie.
export const deleteCookie = (
  name: string,
  reqResObj: ReqResObj,
  options: CookieOptions
): void => {
  // "If the value is omitted, an outbound header with an expired
  // date is used to delete the cookie."
  // https://github.com/pillarjs/cookies#cookiesset-name--value---options--
  setCookie(name, undefined, reqResObj, options)
}
