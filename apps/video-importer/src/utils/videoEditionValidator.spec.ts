import assert from 'node:assert/strict'
import { afterEach, describe, it, mock } from 'node:test'

function getModuleExports<T>(module: T): any {
  return (module as any)['module.exports'] ?? (module as any).default ?? module
}

describe('videoEditionValidator', () => {
  afterEach(() => {
    mock.reset()
  })

  it('should reject when validateLanguage cannot find the language', async () => {
    process.env.SKIP_ENV_VALIDATION = '1'

    const requestMock = mock.fn(async () => ({ language: null }))

    mock.module('../gql/graphqlClient', {
      cache: true,
      namedExports: {
        getGraphQLClient: async () => ({
          request: requestMock
        })
      }
    })

    const validatorModule = await import('./videoEditionValidator')
    const { validateLanguage } = getModuleExports(validatorModule)

    await assert.rejects(
      () => validateLanguage('999'),
      new Error('Language with ID "999" does not exist in the database')
    )

    assert.equal(requestMock.mock.calls.length, 1)
  })
})
