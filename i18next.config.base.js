module.exports = {
  locales: ['en'],
  extract: {
    output: 'libs/locales/{{language}}/{{namespace}}.json',
    indentation: 2,
    nsSeparator: false,
    keySeparator: false,
    defaultValue: (key) => key,
    // Match old i18next-parser behavior: preserve keys not found in source.
    // The old parser never removed unused keys; i18next-cli defaults to true.
    removeUnusedKeys: false,
    sort: false
  }
}
