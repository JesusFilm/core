import {
  locales,
  getLocaleOptions,
  getLocaleOption,
  getLocaleLabel
} from './locales'

describe('locales', () => {
  it('should return langauge and region in locale label', () => {
    const label = getLocaleLabel({
      locale: 'en-NZ',
      language: 'English',
      region: 'New Zealand'
    })
    expect(label).toEqual('English (NZ)')
  })

  it('should return locale option based on locale key', () => {
    const option = getLocaleOption('en-NZ')
    expect(option).toEqual({ value: 'en-NZ', label: 'English (NZ)' })
  })

  it('should return en-US locale option if incorrect locale', () => {
    const option = getLocaleOption('en-ABC')
    expect(option).toEqual({ value: 'en-US', label: 'English (US)' })
  })

  it('should return all locale options', () => {
    const options = getLocaleOptions()

    expect(options.length).toEqual(Object.keys(locales).length)
    expect(options[0]).toEqual(getLocaleOption(options[0].value))
    expect(options[options.length - 1]).toEqual(
      getLocaleOption(options[options.length - 1].value)
    )
  })
})
