// eslint-disable-next-line @nx/enforce-module-boundaries
const i18nextConfigBase = require('../../i18next.config.base')
// eslint-disable-next-line @nx/enforce-module-boundaries
const assertExtractInput = require('../../i18next.assert-input')

module.exports = {
  ...i18nextConfigBase,
  extract: {
    ...i18nextConfigBase.extract,
    defaultNS: 'apps-resources',
    // Globs are resolved from the workspace root (the nx target runs there),
    // so they must be prefixed with the project path. See NES-1723.
    input: assertExtractInput([
      'apps/resources/src/**/*.{js,jsx,ts,tsx}',
      'apps/resources/pages/**/*.{js,jsx,ts,tsx}'
    ])
  }
}
