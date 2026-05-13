import commonConfig from '../shared/eslint/common.mjs'

export default [
  ...commonConfig,
  {
    ignores: ['libs/llm-evals/vitest.evals.mts']
  },
  {
    files: [
      'libs/llm-evals/scenarios/**/*.ts',
      'libs/llm-evals/eval.spec.ts',
      'libs/llm-evals/src/judge.ts'
    ],
    rules: {
      'i18next/no-literal-string': 'off'
    }
  }
]
