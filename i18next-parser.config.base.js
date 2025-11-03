module.exports = {
  indentation: 2,
  lexers: {
    js: ['JavascriptLexer'],
    ts: ['JavascriptLexer'],
    jsx: ['JsxLexer'],
    tsx: ['JsxLexer'],
    default: ['JavascriptLexer']
  },
  locales: ['en'],
  output: 'libs/locales/$LOCALE/$NAMESPACE.json',
  verbose: true,
  namespaceSeparator: false,
  keySeparator: false,
  useKeysAsDefaultValue: true,
  defaultValue: function (lng, ns, key) {
    return key
  }
}
