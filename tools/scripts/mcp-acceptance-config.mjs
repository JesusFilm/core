import { resolve } from 'node:path'

export function suiteConfiguration(suite, directory) {
  return `import base from ${JSON.stringify(resolve(suite.config))}
export default {
  ...base, root: ${JSON.stringify(resolve(suite.root))},
  test: { ...base.test, fileParallelism: false, maxWorkers: 1,
    reporters: ['default', 'json'],
    outputFile: { json: ${JSON.stringify(resolve(directory, 'tests.json'))} },
    coverage: { ...base.test.coverage,
      reportsDirectory: ${JSON.stringify(resolve(directory, 'coverage'))},
      reporter: ['json', ['cobertura', { projectRoot: ${JSON.stringify(resolve('.'))} }]]
    }
  }
}
`
}
