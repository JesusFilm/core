module.exports = {
  indentation: 2,
  lexers: {
    js: ['JsxLexer'],
    ts: ['JsxLexer'],
    jsx: ['JsxLexer'],
    tsx: ['JsxLexer'],
    default: ['JsxLexer']
  },
  locales: ['en'],
  output: 'apps/journeys/public/locales/$LOCALE/$NAMESPACE.json',
  input: ['src/**/*.{js,jsx,ts,tsx}', 'pages/**/*.{js,jsx,ts,tsx}'],
  verbose: true,
  namespaceSeparator: false,
  keySeparator: false,
  useKeysAsDefaultValue: true,
  defaultNamespace: 'common'
}
