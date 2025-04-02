export const listProjectStrings = jest
  .fn()
  .mockResolvedValue([{ data: 'string1' }])

export const listLanguageTranslations = jest
  .fn()
  .mockResolvedValue([{ data: 'translation1' }])

export class SourceStrings {
  constructor(config: { token: string }) {
    // Implementation not needed for mock
  }
  listProjectStrings = listProjectStrings
}

export class StringTranslations {
  constructor(config: { token: string }) {
    // Implementation not needed for mock
  }
  listLanguageTranslations = listLanguageTranslations
}

// Export models that are used in type assertions
export const StringTranslationsModel = {
  PlainLanguageTranslation: Symbol('PlainLanguageTranslation'),
  PluralLanguageTranslation: Symbol('PluralLanguageTranslation')
}

export const SourceStringsModel = {
  String: Symbol('String'),
  Type: {
    TEXT: 0
  }
}
