// eslint-disable-next-line @nx/enforce-module-boundaries
const i18nextConfigBase = require('../../i18next.config.base')

module.exports = {
  ...i18nextConfigBase,
  extract: {
    ...i18nextConfigBase.extract,
    defaultNS: 'apps-watch',
    input: ['src/**/*.{js,jsx,ts,tsx}', 'pages/**/*.{js,jsx,ts,tsx}']
  }
}
