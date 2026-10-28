import { buildHTTPExecutor } from '@graphql-tools/executor-http'

import { yoga } from '../src/yoga'

export function getClient(
  options?: Omit<Parameters<typeof buildHTTPExecutor>[0], 'fetch'>
): ReturnType<typeof buildHTTPExecutor> {
  return buildHTTPExecutor({
    ...options,
    fetch: yoga.fetch.bind({})
  })
}
