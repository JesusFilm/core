module.exports = {
  locales: ['en'],
  extract: {
    output: 'libs/locales/{{language}}/{{namespace}}.json',
    indentation: 2,
    nsSeparator: false,
    keySeparator: false,
    defaultValue: (key) => key,
    removeUnusedKeys: true
  }
}
