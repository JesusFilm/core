const i18nextParserConfigBase = require('../../i18next-parser.config.base')

module.exports = {
  ...i18nextParserConfigBase,
  defaultNamespace: 'apps-watch',
  input: ['src/**/*.{js,jsx,ts,tsx}', 'pages/**/*.{js,jsx,ts,tsx}']
}
