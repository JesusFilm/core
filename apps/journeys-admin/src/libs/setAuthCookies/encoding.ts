// https://github.com/gladly-team/next-firebase-auth/blob/v1.x/src/encoding.ts

/**
 * Decode a base64 value to an object.
 *
 * @param {String} string
 * @return {Object}
 */
export const decodeBase64 = (str: string): any => {
  const body = Buffer.from(str, 'base64').toString('utf8')
  return JSON.parse(body)
}

/**
 * Encode an object into a base64-encoded JSON string.
 *
 * @param {Object} obj
 * @return {String}
 * @private
 */
export const encodeBase64 = (obj: object | string): string => {
  const str = JSON.stringify(obj)
  return Buffer.from(str).toString('base64')
}
