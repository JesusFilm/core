import { parseUrl } from './parseUrl'

/** The editor's one URL rule before the API checks the rest: an absolute https address. */
export function isHttpsUrl(value: string): boolean {
  return parseUrl(value)?.protocol === 'https:'
}
