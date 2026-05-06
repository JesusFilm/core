const i18nextConfigBase = require('../../i18next.config.base')

module.exports = {
  ...i18nextConfigBase,
  extract: {
    ...i18nextConfigBase.extract,
    defaultNS: 'apps-journeys-admin',
    input: ['src/**/*.{js,jsx,ts,tsx}', 'pages/**/*.{js,jsx,ts,tsx}']
  }
}
