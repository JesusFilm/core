const i18nextParserConfigBase = require('../../../i18next-parser.config.base')

module.exports = {
  ...i18nextParserConfigBase,
  defaultNamespace: 'libs-journeys-ui',
  input: ['src/**/*.{js,jsx,ts,tsx}']
}
