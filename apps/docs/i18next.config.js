// eslint-disable-next-line @nx/enforce-module-boundaries
const i18nextConfigBase = require('../../i18next.config.base')
// eslint-disable-next-line @nx/enforce-module-boundaries
const assertExtractInput = require('../../i18next.assert-input')

module.exports = {
  ...i18nextConfigBase,
  extract: {
    ...i18nextConfigBase.extract,
    defaultNS: 'apps-docs',
    // Globs are resolved from the workspace root (the nx target runs there),
    // so they must be prefixed with the project path. See NES-1723.
    input: assertExtractInput(['apps/docs/src/**/*.{js,jsx,ts,tsx}'])
  }
}
