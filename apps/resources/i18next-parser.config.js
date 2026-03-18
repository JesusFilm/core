const i18nextParserConfigBase = require('../../i18next-parser.config.base')

module.exports = {
  ...i18nextParserConfigBase,
  defaultNamespace: 'apps-resources',
  input: ['src/**/*.{js,jsx,ts,tsx}', 'pages/**/*.{js,jsx,ts,tsx}']
}
