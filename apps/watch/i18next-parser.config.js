module.exports = {
  indentation: 2,
  lexers: {
    js: ['JavascriptLexer'],
    ts: ['JavascriptLexer'],
    jsx: ['JsxLexer'],
    tsx: [
      {
        lexer: 'JsxLexer',
        functions: ['t', 'rich', 'markup'],
        namespaceFuntions: ['useTranslations', 'getTranslations']
      }
    ],
    default: ['JavascriptLexer']
  },
  locales: ['en'],
  output: 'libs/locales/$LOCALE/$NAMESPACE.json',
  verbose: true,
  namespaceSeparator: false,
  keySeparator: false,
  useKeysAsDefaultValue: true,
  defaultNamespace: 'apps-watch',
  input: ['src/**/*.{js,jsx,ts,tsx}']
}
