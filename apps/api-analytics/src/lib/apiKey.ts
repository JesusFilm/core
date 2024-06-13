import { createHash } from 'crypto'

// the follow is a javascript version of the do_hash method in
// lib/plausible/auth/api_key.ex file of the plausible/analytics github repo
// https://github.com/plausible/analytics/blob/master/lib/plausible/auth/api_key.ex#L39
export function hash(apiKey: string): string {
  return createHash('sha256')
    .update(`${process.env.PLAUSIBLE_SECRET_KEY_BASE}${apiKey}`)
    .digest('hex')
    .toLowerCase()
}
